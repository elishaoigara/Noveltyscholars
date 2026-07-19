"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Calculator,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculatePrice, formatCurrency, generateOrderCode } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import type { Service, ServiceType } from "@/lib/types";

const orderSchema = z.object({
  service_id: z.string().min(1, "Please select a service"),
  subject: z.string().min(2, "Subject is required"),
  topic: z.string().min(2, "Topic is required"),
  academic_level: z.enum(["High School", "Bachelors", "Masters", "PhD"]),
  pages: z.number().min(1).max(50),
  words: z.number(),
  deadline: z.string().min(1, "Deadline is required"),
  description: z.string().min(10, "Please provide at least 10 characters"),
  // Online Class / Exam fields
  lms_platform: z.string().optional(),
  login_credentials: z.string().optional(),
  class_duration: z.string().optional(),
  exam_date: z.string().optional(),
  exam_duration: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

const LMS_PLATFORMS = ["Canvas", "Blackboard", "Moodle", "D2L", "Schoology", "Other"];
const CLASS_DURATIONS = ["4 weeks", "8 weeks", "12 weeks", "Full Semester", "Other"];

function OrderPageContent() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [livePrice, setLivePrice] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      service_id: "",
      subject: "",
      topic: "",
      academic_level: "High School",
      pages: 1,
      words: 250,
      deadline: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split("T")[0];
      })(),
      description: "",
      lms_platform: "",
      login_credentials: "",
      class_duration: "",
      exam_date: "",
      exam_duration: "",
    },
  });

  const { watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  // Fetch services
  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) {
        const svcs: Service[] = data.map((s) => ({
          ...s,
          features: Array.isArray(s.features) ? s.features : [],
          service_type: (s as Record<string, unknown>).service_type as ServiceType || "STANDARD",
          is_featured: !!(s as Record<string, unknown>).is_featured,
        }));
        setServices(svcs);

        // Check URL params for pre-selected service
        const serviceParam = searchParams.get("service");
        if (serviceParam) {
          const found = svcs.find((s) => s.slug === serviceParam || s.id === serviceParam);
          if (found) {
            setValue("service_id", found.id);
          }
        }
      }
      setLoadingServices(false);
    }
    loadServices();
  }, [supabase, searchParams, setValue]);

  // Calculate price on changes
  const recalculatePrice = useCallback(() => {
    const service = services.find((s) => s.id === watchedValues.service_id);
    if (!service || !watchedValues.deadline) {
      setLivePrice(0);
      return;
    }
    const price = calculatePrice(
      service.base_price,
      watchedValues.pages,
      watchedValues.deadline,
      watchedValues.academic_level
    );
    setLivePrice(price);
  }, [services, watchedValues]);

  useEffect(() => {
    recalculatePrice();
  }, [recalculatePrice]);

  // Update words when pages change
  const handlePagesChange = (val: number[]) => {
    setValue("pages", val[0]);
    setValue("words", val[0] * 250);
  };

  // Tomorrow min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const selectedService = services.find((s) => s.id === watchedValues.service_id);
  const serviceType: ServiceType = (selectedService as Record<string, unknown> | undefined)?.service_type as ServiceType || "STANDARD";
  const isOnlineClass = serviceType === "ONLINE_CLASS";
  const isOnlineExam = serviceType === "ONLINE_EXAM";
  const isSpecialService = isOnlineClass || isOnlineExam;

  const handleNext = async () => {
    let fieldsToValidate: (keyof OrderForm)[] = [];
    if (step === 1) {
      fieldsToValidate = ["service_id", "subject", "topic", "academic_level"];
      if (isOnlineClass) {
        fieldsToValidate = [...fieldsToValidate, "lms_platform", "class_duration"];
      }
      if (isOnlineExam) {
        fieldsToValidate = [...fieldsToValidate, "lms_platform", "exam_date"];
      }
    } else if (step === 2) {
      if (isSpecialService) {
        fieldsToValidate = ["description"];
      } else {
        fieldsToValidate = ["pages", "deadline", "description"];
      }
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: OrderForm) => {
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please login to place an order.",
      });
      router.push("/login");
      return;
    }

    const orderCode = generateOrderCode();

    const orderPayload = {
      order_code: orderCode,
      user_id: user.id,
      service_id: data.service_id,
      subject: data.subject,
      topic: data.topic,
      academic_level: data.academic_level,
      pages: data.pages,
      words: data.words,
      deadline: data.deadline,
      description: data.description,
      total_price: livePrice,
      status: "PENDING_PAYMENT",
      ...(isOnlineClass || isOnlineExam ? {
        lms_platform: data.lms_platform || null,
        login_credentials: data.login_credentials || null,
      } : {}),
      ...(isOnlineClass ? {
        class_duration: data.class_duration || null,
      } : {}),
    };

    const { data: order, error } = await supabase
      .from("orders")
      .insert(orderPayload as any)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message,
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Order placed!",
      description: `Your order ${orderCode} has been created.`,
    });

    router.push(`/checkout/${order.id}`);
  };

  const handleFileUploaded = (fileName: string) => {
    setUploadedFiles((prev) => [...prev, fileName]);
  };

  if (loadingServices) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
                s < step
                  ? "bg-primary text-white"
                  : s === step
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Service & Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Order Details</CardTitle>
              <CardDescription>
                Choose your service and provide basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Service */}
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select
                  value={watchedValues.service_id}
                  onValueChange={(v) => {
                    setValue("service_id", v);
                    // Reset special fields when service changes
                    setValue("lms_platform", "");
                    setValue("login_credentials", "");
                    setValue("class_duration", "");
                    setValue("exam_date", "");
                    setValue("exam_duration", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {formatCurrency(s.base_price)}/page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_id && (
                  <p className="text-sm text-red-500">{errors.service_id.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Business Management, Nursing, Law"
                  {...form.register("subject")}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">{errors.subject.message}</p>
                )}
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., The Impact of Globalization on Small Businesses"
                  {...form.register("topic")}
                />
                {errors.topic && (
                  <p className="text-sm text-red-500">{errors.topic.message}</p>
                )}
              </div>

              {/* Academic Level - only for STANDARD */}
              {!isSpecialService && (
                <div className="space-y-2">
                  <Label>Academic Level *</Label>
                  <Select
                    value={watchedValues.academic_level}
                    onValueChange={(v) =>
                      setValue("academic_level", v as OrderForm["academic_level"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Bachelors">Bachelors</SelectItem>
                      <SelectItem value="Masters">Masters</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ONLINE_CLASS specific fields */}
              {isOnlineClass && selectedService && (
                <div className="space-y-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-sm font-semibold text-indigo-700">
                    🎓 Online Class Details
                  </p>

                  {/* LMS Platform */}
                  <div className="space-y-2">
                    <Label>LMS Platform *</Label>
                    <Select
                      value={watchedValues.lms_platform || ""}
                      onValueChange={(v) => setValue("lms_platform", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your LMS platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {LMS_PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.lms_platform && (
                      <p className="text-sm text-red-500">{errors.lms_platform.message}</p>
                    )}
                  </div>

                  {/* Class Duration */}
                  <div className="space-y-2">
                    <Label>Class Duration *</Label>
                    <Select
                      value={watchedValues.class_duration || ""}
                      onValueChange={(v) => setValue("class_duration", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_DURATIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.class_duration && (
                      <p className="text-sm text-red-500">{errors.class_duration.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ONLINE_EXAM specific fields */}
              {isOnlineExam && selectedService && (
                <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm font-semibold text-orange-700">
                    📝 Online Exam Details
                  </p>

                  {/* LMS Platform */}
                  <div className="space-y-2">
                    <Label>Exam Platform *</Label>
                    <Select
                      value={watchedValues.lms_platform || ""}
                      onValueChange={(v) => setValue("lms_platform", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {LMS_PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exam Date */}
                  <div className="space-y-2">
                    <Label htmlFor="exam_date">Exam Date *</Label>
                    <Input
                      id="exam_date"
                      type="date"
                      min={minDate}
                      {...form.register("exam_date")}
                    />
                    {errors.exam_date && (
                      <p className="text-sm text-red-500">{errors.exam_date.message}</p>
                    )}
                  </div>

                  {/* Exam Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="exam_duration">Exam Duration</Label>
                    <Input
                      id="exam_duration"
                      placeholder="e.g., 2 hours, 3 hours"
                      {...form.register("exam_duration")}
                    />
                  </div>
                </div>
              )}

              {/* Login credentials for special services */}
              {isSpecialService && (
                <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-700">
                      We use bank-level 256-bit encryption to protect your data
                    </span>
                  </div>
                  <Label htmlFor="login_credentials">Login Credentials (Optional at this stage)</Label>
                  <Textarea
                    id="login_credentials"
                    rows={3}
                    placeholder="You can provide your LMS login credentials now or share them later via our secure chat. Your data is encrypted and never shared."
                    {...form.register("login_credentials")}
                    className="text-sm"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-primary" />
                <span>
                  Live Price:{" "}
                  <strong className="text-primary">
                    {livePrice > 0 ? formatCurrency(livePrice) : "--"}
                  </strong>
                </span>
              </div>
              <Button type="button" onClick={handleNext} className="gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Pages, Deadline, Description, Files */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Requirements</CardTitle>
              <CardDescription>
                {isSpecialService
                  ? "Describe your needs and upload reference materials"
                  : "Set your requirements and upload reference materials"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Pages - only for STANDARD */}
              {!isSpecialService && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Number of Pages: {watchedValues.pages}</Label>
                    <span className="text-sm text-muted-foreground">
                      ~{watchedValues.pages * 250} words
                    </span>
                  </div>
                  <Slider
                    value={[watchedValues.pages]}
                    onValueChange={handlePagesChange}
                    min={1}
                    max={50}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>50 pages</span>
                  </div>
                </div>
              )}

              {/* Deadline - only for STANDARD */}
              {!isSpecialService && (
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    {...form.register("deadline")}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select your deadline. Urgent orders (less than 24 hours) may cost more.
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {isSpecialService ? "Instructions / Requirements *" : "Description / Instructions *"}
                </Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder={
                    isSpecialService
                      ? "Describe your class/exam in detail. Include course name, topics covered, grading rubric, etc."
                      : "Provide detailed instructions for your paper. Include formatting style, number of sources, specific requirements, etc."
                  }
                  {...form.register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Reference Files (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload any reference materials, rubrics, or instructions.
                </p>
                <FileUpload
                  orderId="pending"
                  onUploadComplete={(file) => handleFileUploaded(file.file_name)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-primary" />
                <span>
                  Live Price:{" "}
                  <strong className="text-primary">
                    {livePrice > 0 ? formatCurrency(livePrice) : "--"}
                  </strong>
                </span>
              </div>
              <Button type="button" onClick={handleNext} className="gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Review &amp; Confirm</CardTitle>
              <CardDescription>
                Review your order details before placing it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedService?.name || "--"}</span>
                </div>
                {isOnlineClass && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LMS Platform</span>
                      <Badge variant="secondary">{watchedValues.lms_platform || "--"}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <Badge variant="secondary">{watchedValues.class_duration || "--"}</Badge>
                    </div>
                  </>
                )}
                {isOnlineExam && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exam Platform</span>
                      <Badge variant="secondary">{watchedValues.lms_platform || "--"}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exam Date</span>
                      <span className="font-medium">
                        {watchedValues.exam_date
                          ? new Date(watchedValues.exam_date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "--"}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">{watchedValues.subject}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Topic</span>
                  <span className="font-medium">{watchedValues.topic}</span>
                </div>
                {!isSpecialService && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Academic Level</span>
                      <Badge variant="secondary">{watchedValues.academic_level}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pages</span>
                      <span className="font-medium">
                        {watchedValues.pages} pages ({watchedValues.pages * 250} words)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">
                        {new Date(watchedValues.deadline).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Files</span>
                  <span className="font-medium">
                    {uploadedFiles.length > 0
                      ? `${uploadedFiles.length} file(s)`
                      : "None"}
                  </span>
                </div>
                {watchedValues.login_credentials && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credentials</span>
                    <Badge className="bg-green-100 text-green-700">Securely Provided ✓</Badge>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price:</span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(livePrice)}
                  </span>
                </div>
                {selectedService && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(selectedService.base_price)}/page &times;{" "}
                    {watchedValues.pages} pages
                    {!isSpecialService && watchedValues.academic_level !== "High School" &&
                      ` (${watchedValues.academic_level} level)`}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row justify-between gap-4 border-t pt-6">
              <Button type="button" variant="outline" onClick={handleBack} className="gap-2 w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Place Order - {formatCurrency(livePrice)}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}