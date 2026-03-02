// Force all auth pages to be dynamically rendered (they depend on Thirdweb SDK
// which requires client-side initialization and cannot be statically generated).
export const dynamic = "force-dynamic";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
