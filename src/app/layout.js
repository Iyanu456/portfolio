
import './globals.css'
import { Inter } from 'next/font/google'



export const metadata = {
  title: 'Iyanu | Software Developer Portfolio',
  description: 'Full-stack Software Engineer Portfolio Website',
  image: './assets/profile.jpg'
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
