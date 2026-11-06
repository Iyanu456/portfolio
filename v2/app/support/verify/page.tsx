import PaymentVerification from "@/components/payment-verification";

export const metadata = { title: "Confirming your support" };

type SearchParamValue = string | string[] | undefined;

function firstParam(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).find(Boolean) || "";
  }
  return value?.trim() || "";
}

export default async function SupportVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: SearchParamValue; trxref?: SearchParamValue; source?: SearchParamValue }>;
}) {
  const params = await searchParams;
  // Paystack may return both `reference` and `trxref`, and some frameworks
  // expose repeated query keys as arrays. Never pass an array to a client
  // component: React/string coercion can turn it into "ref,ref".
  const reference = firstParam(params.reference) || firstParam(params.trxref);
  const isSubstackReturn = firstParam(params.source) === "substack";
  return (
    <PaymentVerification
      reference={reference}
      returnTo={isSubstackReturn ? "https://substack.com/@byiyanu" : undefined}
    />
  );
}
