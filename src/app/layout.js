import './globals.css'
import Header from './components/Header'



export const metadata = {
  title: 'Iyanu | Software Developer Portfolio',
  description: 'Full-stack Software Engineer Portfolio Website',
  image: './assets/profile.jpg'
}

const currentYear = new Date().getFullYear();

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <Header />  
        {children}
        <footer className="text-center text-[0.95em] mb-[5em] px-[2em]">
        <p>Copyright © {currentYear} All rights reserved | Iyanuoluwa Oyerinde</p>
      </footer>
      </body>
    </html>
  )
}
