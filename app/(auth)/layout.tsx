export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      arriba
      {children}
      abajo
    </>
  )
}