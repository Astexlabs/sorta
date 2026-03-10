import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a0a";
const SURFACE = "#111111";
const BORDER = "#1f1f1f";
const ACCENT = "#6366f1"; // indigo
const ACCENT2 = "#a78bfa"; // violet tint
const TEXT = "#f5f5f5";
const MUTED = "#555558";
const ERROR = "#f87171";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step =
  | "welcome"
  | "personal"
  | "address"
  | "work"
  | "id_type"
  | "id_upload"
  | "review"
  | "verifying"
  | "done";

const STEPS: Step[] = [
  "welcome",
  "personal",
  "address",
  "work",
  "id_type",
  "id_upload",
  "review",
  "verifying",
  "done",
];
const PROGRESS_STEPS: Step[] = [
  "personal",
  "address",
  "work",
  "id_type",
  "id_upload",
  "review",
];

interface FormData {
  full_legal_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  address_line1: string;
  address_city: string;
  address_country: string;
  work_eligibility: string;
  tax_id: string;
  id_type: string;
  id_number: string;
  id_front_uri: string;
  id_back_uri: string;
}

const EMPTY: FormData = {
  full_legal_name: "",
  date_of_birth: "",
  nationality: "",
  phone_number: "",
  address_line1: "",
  address_city: "",
  address_country: "",
  work_eligibility: "",
  tax_id: "",
  id_type: "",
  id_number: "",
  id_front_uri: "",
  id_back_uri: "",
};

// ─── Reusable atoms ───────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "words",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: MUTED,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#333336"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: SURFACE,
          borderWidth: 1,
          borderColor: focused ? ACCENT : BORDER,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: TEXT,
          fontSize: 15,
          fontWeight: "400",
        }}
      />
      {hint ? (
        <Text style={{ color: MUTED, fontSize: 11, marginTop: 5 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1.5,
        borderColor: selected ? ACCENT : BORDER,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: selected ? `${ACCENT}18` : SURFACE,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: selected ? ACCENT : MUTED,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {selected && (
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: ACCENT,
            }}
          />
        )}
      </View>
      <Text
        style={{
          color: selected ? TEXT : "#888",
          fontSize: 14,
          fontWeight: selected ? "500" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: disabled ? "#1a1a1a" : ACCENT,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        opacity: pressed ? 0.85 : 1,
        marginTop: 8,
      })}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          style={{
            color: disabled ? MUTED : "white",
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: Step }) {
  const idx = PROGRESS_STEPS.indexOf(step);
  if (idx < 0) return null;
  const pct = ((idx + 1) / PROGRESS_STEPS.length) * 100;
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 }}>
      <View style={{ height: 2, backgroundColor: BORDER, borderRadius: 2 }}>
        <View
          style={{
            height: 2,
            width: `${pct}%`,
            backgroundColor: ACCENT,
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{ color: MUTED, fontSize: 11, marginTop: 6 }}>
        Step {idx + 1} of {PROGRESS_STEPS.length}
      </Text>
    </View>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 28,
        paddingBottom: 48,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${ACCENT}20`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          borderWidth: 1,
          borderColor: `${ACCENT}30`,
        }}
      >
        <Text style={{ fontSize: 28 }}>🧩</Text>
      </View>
      <Text
        style={{
          color: TEXT,
          fontSize: 34,
          fontWeight: "700",
          lineHeight: 42,
          marginBottom: 14,
        }}
      >
        Let's get{"\n"}you verified.
      </Text>
      <Text
        style={{ color: MUTED, fontSize: 15, lineHeight: 24, marginBottom: 40 }}
      >
        To work as an annotator and receive payments, we need to confirm your
        identity. It only takes 3 minutes.
      </Text>

      <View style={{ gap: 12, marginBottom: 36 }}>
        {[
          { icon: "👤", text: "Personal & contact details" },
          { icon: "🏠", text: "Address & work eligibility" },
          { icon: "🪪", text: "Government-issued ID" },
        ].map((item) => (
          <View
            key={item.text}
            style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
          >
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={{ color: "#888", fontSize: 14 }}>{item.text}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton label="Get started" onPress={onNext} />
      <Text
        style={{
          color: MUTED,
          fontSize: 12,
          textAlign: "center",
          marginTop: 16,
          lineHeight: 18,
        }}
      >
        Your data is encrypted and only used for legal compliance. We never sell
        your information.
      </Text>
    </View>
  );
}

function PersonalStep({ data, update, onNext, onBack }: StepProps) {
  const valid =
    data.full_legal_name.trim().length > 2 &&
    data.date_of_birth.trim().length === 10 &&
    data.nationality.trim().length > 1 &&
    data.phone_number.trim().length > 6;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        Personal details
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        As they appear on your official ID.
      </Text>

      <Field
        label="Full legal name"
        value={data.full_legal_name}
        onChange={(v) => update("full_legal_name", v)}
        placeholder="e.g. Amara Okonkwo"
      />
      <Field
        label="Date of birth"
        value={data.date_of_birth}
        onChange={(v) => update("date_of_birth", v)}
        placeholder="YYYY-MM-DD"
        keyboardType="numeric"
        autoCapitalize="none"
        hint="Format: YYYY-MM-DD"
      />
      <Field
        label="Nationality"
        value={data.nationality}
        onChange={(v) => update("nationality", v)}
        placeholder="e.g. Nigerian"
      />
      <Field
        label="Phone number"
        value={data.phone_number}
        onChange={(v) => update("phone_number", v)}
        placeholder="+234 812 000 0000"
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <PrimaryButton label="Continue" onPress={onNext} disabled={!valid} />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function AddressStep({ data, update, onNext, onBack }: StepProps) {
  const valid =
    data.address_line1.trim().length > 3 &&
    data.address_city.trim().length > 1 &&
    data.address_country.trim().length > 1;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        Your address
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        Your current residential address.
      </Text>

      <Field
        label="Street address"
        value={data.address_line1}
        onChange={(v) => update("address_line1", v)}
        placeholder="12 Lagos Island Rd, Victoria Island"
      />
      <Field
        label="City"
        value={data.address_city}
        onChange={(v) => update("address_city", v)}
        placeholder="Lagos"
      />
      <Field
        label="Country"
        value={data.address_country}
        onChange={(v) => update("address_country", v)}
        placeholder="Nigeria"
      />

      <PrimaryButton label="Continue" onPress={onNext} disabled={!valid} />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function WorkStep({ data, update, onNext, onBack }: StepProps) {
  const options: { value: string; label: string }[] = [
    { value: "citizen", label: "Citizen / National" },
    { value: "permanent_resident", label: "Permanent Resident" },
    { value: "work_visa", label: "Work Visa / Permit" },
    { value: "other", label: "Other arrangement" },
  ];
  const valid = data.work_eligibility.length > 0;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        Work eligibility
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        How are you legally authorised to work in your country?
      </Text>

      {options.map((o) => (
        <SelectChip
          key={o.value}
          label={o.label}
          selected={data.work_eligibility === o.value}
          onPress={() => {
            update("work_eligibility", o.value);
            Haptics.selectionAsync();
          }}
        />
      ))}

      <View style={{ height: 16 }} />
      <Field
        label="Tax ID / NIN / TIN (optional)"
        value={data.tax_id}
        onChange={(v) => update("tax_id", v)}
        placeholder="e.g. 12345678901"
        keyboardType="numeric"
        autoCapitalize="none"
        hint="National Identification Number or Tax Identification Number"
      />

      <PrimaryButton label="Continue" onPress={onNext} disabled={!valid} />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function IdTypeStep({ data, update, onNext, onBack }: StepProps) {
  const idTypes: { value: string; label: string; desc: string }[] = [
    {
      value: "national_id",
      label: "National ID Card",
      desc: "NIN slip or national ID card",
    },
    {
      value: "passport",
      label: "International Passport",
      desc: "Valid biometric passport",
    },
    {
      value: "drivers_license",
      label: "Driver's Licence",
      desc: "Current valid licence",
    },
  ];

  const valid = data.id_type.length > 0 && data.id_number.trim().length > 4;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        ID document
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        Select the type of government-issued ID you'll upload.
      </Text>

      {idTypes.map((t) => (
        <Pressable
          key={t.value}
          onPress={() => {
            update("id_type", t.value);
            Haptics.selectionAsync();
          }}
          style={{
            borderWidth: 1.5,
            borderColor: data.id_type === t.value ? ACCENT : BORDER,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            backgroundColor: data.id_type === t.value ? `${ACCENT}18` : SURFACE,
          }}
        >
          <Text
            style={{
              color: data.id_type === t.value ? TEXT : "#888",
              fontWeight: "600",
              fontSize: 14,
              marginBottom: 3,
            }}
          >
            {t.label}
          </Text>
          <Text style={{ color: MUTED, fontSize: 12 }}>{t.desc}</Text>
        </Pressable>
      ))}

      <View style={{ height: 8 }} />
      <Field
        label="Document number"
        value={data.id_number}
        onChange={(v) => update("id_number", v)}
        placeholder="e.g. A00000000"
        autoCapitalize="characters"
        hint="Exactly as printed on the document"
      />

      <PrimaryButton label="Continue" onPress={onNext} disabled={!valid} />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function IdUploadStep({ data, update, onNext, onBack }: StepProps) {
  const needsBack = data.id_type !== "passport";
  const ready =
    data.id_front_uri.length > 0 && (!needsBack || data.id_back_uri.length > 0);

  const pick = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 2],
    });
    if (!result.canceled && result.assets[0]) {
      update(
        side === "front" ? "id_front_uri" : "id_back_uri",
        result.assets[0].uri,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  function UploadBox({
    label,
    uri,
    onPress,
  }: {
    label: string;
    uri: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          borderWidth: 1.5,
          borderColor: uri ? ACCENT : BORDER,
          borderStyle: uri ? "solid" : "dashed",
          borderRadius: 16,
          height: 160,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: uri ? `${ACCENT}10` : SURFACE,
          marginBottom: 14,
          overflow: "hidden",
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%", borderRadius: 14 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 28 }}>📷</Text>
            <Text style={{ color: MUTED, fontSize: 13, fontWeight: "500" }}>
              {label}
            </Text>
            <Text style={{ color: "#333", fontSize: 11 }}>Tap to upload</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        Upload your ID
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 8 }}>
        {data.id_type === "passport"
          ? "Upload the photo page of your passport."
          : "Upload both sides of your ID card clearly."}
      </Text>

      <View
        style={{
          backgroundColor: `${ACCENT}10`,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: `${ACCENT}20`,
          padding: 12,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: ACCENT2, fontSize: 12, lineHeight: 18 }}>
          Make sure all four corners are visible, the text is readable, and
          there is no glare or blur.
        </Text>
      </View>

      <UploadBox
        label="Front of ID"
        uri={data.id_front_uri}
        onPress={() => pick("front")}
      />
      {needsBack && (
        <UploadBox
          label="Back of ID"
          uri={data.id_back_uri}
          onPress={() => pick("back")}
        />
      )}

      <PrimaryButton label="Continue" onPress={onNext} disabled={!ready} />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function ReviewStep({
  data,
  onSubmit,
  onBack,
  loading,
}: StepProps & { loading: boolean }) {
  const rows: { label: string; value: string }[] = [
    { label: "Full name", value: data.full_legal_name },
    { label: "Date of birth", value: data.date_of_birth },
    { label: "Nationality", value: data.nationality },
    { label: "Phone", value: data.phone_number },
    { label: "Address", value: `${data.address_line1}, ${data.address_city}` },
    { label: "Country", value: data.address_country },
    {
      label: "Work eligibility",
      value: data.work_eligibility.replace("_", " "),
    },
    { label: "ID type", value: data.id_type.replace("_", " ") },
    { label: "ID number", value: data.id_number },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 6,
          marginTop: 8,
        }}
      >
        Review & submit
      </Text>
      <Text style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>
        Confirm everything is correct before submitting.
      </Text>

      <View
        style={{
          backgroundColor: SURFACE,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          marginBottom: 20,
        }}
      >
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderColor: BORDER,
            }}
          >
            <Text style={{ color: MUTED, fontSize: 12, flex: 1 }}>
              {row.label}
            </Text>
            <Text
              style={{
                color: TEXT,
                fontSize: 13,
                flex: 2,
                textAlign: "right",
                fontWeight: "500",
              }}
            >
              {row.value || "—"}
            </Text>
          </View>
        ))}
      </View>

      {/* ID thumbnail strip */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
        {[data.id_front_uri, data.id_back_uri].filter(Boolean).map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ flex: 1, height: 72, borderRadius: 10 }}
            resizeMode="cover"
          />
        ))}
      </View>

      <View
        style={{
          backgroundColor: `${ACCENT}10`,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: `${ACCENT}20`,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: ACCENT2, fontSize: 12, lineHeight: 18 }}>
          By submitting, you confirm the information above is accurate and you
          consent to identity verification.
        </Text>
      </View>

      <PrimaryButton
        label="Submit for verification"
        onPress={onSubmit!}
        loading={loading}
      />
      <BackButton onPress={onBack} />
    </ScrollView>
  );
}

function VerifyingStep() {
  const [dots, setDots] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useState(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    const dotsTimer = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      500,
    );
    return () => {
      pulse.stop();
      clearInterval(dotsTimer);
    };
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 36,
      }}
    >
      <Animated.View
        style={[
          {
            width: 100,
            height: 100,
            borderRadius: 32,
            backgroundColor: `${ACCENT}20`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
            borderWidth: 1,
            borderColor: `${ACCENT}40`,
          },
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={{ fontSize: 44 }}>🔍</Text>
      </Animated.View>
      <Text
        style={{
          color: TEXT,
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Verifying your ID{dots}
      </Text>
      <Text
        style={{
          color: MUTED,
          fontSize: 14,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        We're securely checking your documents with our verification partner.
        This usually takes a few seconds.
      </Text>
    </View>
  );
}

function DoneStep({ onContinue }: { onContinue: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 36,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#15803d20",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          borderWidth: 1,
          borderColor: "#15803d40",
        }}
      >
        <Text style={{ fontSize: 48 }}>✓</Text>
      </View>
      <Text
        style={{
          color: TEXT,
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Identity verified!
      </Text>
      <Text
        style={{
          color: MUTED,
          fontSize: 15,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 48,
        }}
      >
        Welcome aboard. Your account is fully activated and you're ready to
        start earning.
      </Text>
      <View style={{ width: "100%" }}>
        <PrimaryButton label="Start annotating →" onPress={onContinue} />
      </View>
    </View>
  );
}

function BackButton({ onPress }: { onPress?: () => void }) {
  if (!onPress) return null;
  return (
    <Pressable
      onPress={onPress}
      style={{ marginTop: 16, alignItems: "center" }}
    >
      <Text style={{ color: MUTED, fontSize: 14 }}>← Back</Text>
    </Pressable>
  );
}

interface StepProps {
  data: FormData;
  update: (key: keyof FormData, value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { getToken } = useAuth();

  const saveKyc = useMutation(api.kyc.saveKycProfile);
  const mockApprove = useMutation(api.kyc.mockApproveKyc);

  const update = (key: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const animateNext = (fn: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -30,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      fn();
      slideAnim.setValue(40);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = (next: Step) => {
    Haptics.selectionAsync();
    animateNext(() => setStep(next));
  };

  const goBack = (prev: Step) => {
    Haptics.selectionAsync();
    animateNext(() => setStep(prev));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveKyc({
        full_legal_name: data.full_legal_name,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality,
        phone_number: data.phone_number,
        address_line1: data.address_line1,
        address_city: data.address_city,
        address_country: data.address_country,
        work_eligibility: data.work_eligibility,
        tax_id: data.tax_id || undefined,
        id_type: data.id_type,
        id_number: data.id_number,
        id_front_uri: data.id_front_uri,
        id_back_uri: data.id_back_uri || undefined,
      });

      goNext("verifying");

      // Simulate verification API round-trip
      await new Promise((r) => setTimeout(r, 3200));
      await mockApprove();

      animateNext(() => setStep("done"));
    } catch (e) {
      console.warn("KYC submit error:", e);
    } finally {
      setLoading(false);
    }
  };

  const showProgress = PROGRESS_STEPS.includes(step);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header bar */}
      {step !== "welcome" && step !== "verifying" && step !== "done" && (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          {showProgress && <ProgressBar step={step} />}
        </View>
      )}

      <Animated.View
        style={{ flex: 1, transform: [{ translateY: slideAnim }] }}
      >
        {step === "welcome" && (
          <WelcomeStep onNext={() => goNext("personal")} />
        )}

        {step === "personal" && (
          <PersonalStep
            data={data}
            update={update}
            onNext={() => goNext("address")}
            onBack={() => goBack("welcome")}
          />
        )}

        {step === "address" && (
          <AddressStep
            data={data}
            update={update}
            onNext={() => goNext("work")}
            onBack={() => goBack("personal")}
          />
        )}

        {step === "work" && (
          <WorkStep
            data={data}
            update={update}
            onNext={() => goNext("id_type")}
            onBack={() => goBack("address")}
          />
        )}

        {step === "id_type" && (
          <IdTypeStep
            data={data}
            update={update}
            onNext={() => goNext("id_upload")}
            onBack={() => goBack("work")}
          />
        )}

        {step === "id_upload" && (
          <IdUploadStep
            data={data}
            update={update}
            onNext={() => goNext("review")}
            onBack={() => goBack("id_type")}
          />
        )}

        {step === "review" && (
          <ReviewStep
            data={data}
            update={update}
            onNext={() => {}}
            onBack={() => goBack("id_upload")}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {step === "verifying" && <VerifyingStep />}

        {step === "done" && (
          <DoneStep onContinue={() => router.replace("/(tabs)")} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
