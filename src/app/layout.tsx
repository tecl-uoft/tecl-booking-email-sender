import "../styles/globals.scss"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{height:"100%"}}>
        <h1 style={{textAlign:"center"}} className="text-4xl">TECL Booking Email Sender</h1>
        {children}
      </body>
    </html>
  )
}
