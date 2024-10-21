import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header(props) {
  return (
    <header className="flex justify-center center-align w-[90%] px-[1.5em] lg:px-[3.34em] py-[2em] ">
      <Link href="/" className="font-bold my-auto ml-0 mr-auto w-[fit-content]">
        Iyanu
      </Link>
      <nav className="grid w-[fit-content] hidden sm:block md:block mr-0 ml-auto">
        <ul className="flex  gap-[2.5em]">
          <li>
            <Link href="#about-me" className="flex gap-3 icon px-4 py-2">
            <span className="text-[#64ffda]">01. </span>
              About
            </Link>
          </li>
          <li>
            <Link href="#projects" className="flex gap-3 icon px-4 py-2">
            <span className="text-[#64ffda]">02. </span>
              Projects
            </Link>
          </li>
          <li>
            <Link href="#contact" className="flex gap-3 icon px-4 py-2">
            <span className="text-[#64ffda]">03. </span>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <button
          onClick={() => props.setMobileMenuOpen(!props.mobileMenuOpen)}
          className="hidden max-sm:block w-[fit-content]"
        >
          {props.mobileMenuOpen ? (
            <Image src="/icons/close_icon.svg" height={24} width={24} alt="menu" className="" color="#ccd6f6"/>
          ) : (
            <Image src="/icons/menu_icon.svg" height={24} width={24} alt="menu" className="" color="#ccd6f6"/>
          )}
        </button>
    </header>
  );
}
