export const metadata = { title: "Beer Game" };
export default function RootLayout({ children }:{children:React.ReactNode}) {
  return (
    <html lang="no">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
