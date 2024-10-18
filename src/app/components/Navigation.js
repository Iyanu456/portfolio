"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer";
import menuIcon from "../assets/icons/menu-1.svg";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navigation(props) {
  const [scrollingUp, setScrollingUp] = useState(true);
  //const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helps close the menu bar when the user clicks any of the links inside the menu dropdown or navigation to another route
  function closeMenuOnNavigation() {
    props.setMobileMenuOpen(false);
  }

  useEffect(() => {
    let prevScrollPos = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setScrollingUp(prevScrollPos > currentScrollPos);
      prevScrollPos = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };
  return (
    <>
	<header
      className={`grid fixed top-0 left-0 right-0 pt-6 pb-3 z-20 px-[2em] md:px-[3em] py-[2em] transition-transform transform duration-300 ${
        scrollingUp || props.mobileMenuOpen ? "translate-y-0 " : "-translate-y-[70%] overflow-y-hidden"
      } text-white py-4`}
    >
      <nav className="flex">
        <motion.div
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className="hover:translate-y-[-5px] transition-transform duration-300 font-bold icon border border-5 border-white my-auto border py-[0.3em] ml-0 mr-auto px-[0.5em] cursor-pointer text-[#ccd6f6] text-[1.1em]"
        >
          Iyanu
        </motion.div>

        <ul className="w-[fit-content] hidden md:flex ml-auto mr-0 gap-8 my-auto">
          <Link href="#about-me" className="w-[fit-content]">
            <motion.li
              variants={navVariants}
              initial="hidden"
              animate="visible"
              className="hover:translate-y-[-5px] transition-transform duration-300 icon w-[fit-content] px-3 py-2"
              style={{
                cursor: "pointer",
                fontFamily: "Jost",
                letterSpacing: "1.06px",
              }}
            >
              <span className="text-[#64ffda]">01. </span> About
            </motion.li>
          </Link>

          <motion.li
            variants={navVariants}
            initial="hidden"
            animate="visible"
            className="hover:translate-y-[-5px] transition-transform duration-300 icon my-auto px-3 py-2"
            style={{
              cursor: "pointer",
              fontFamily: "Jost",
              letterSpacing: "1.06px",
            }}
          >
            <Link href="#projects">
              <span className="text-[#64ffda]">02. </span> Projects
            </Link>
          </motion.li>

          <motion.li
            variants={navVariants}
            initial="hidden"
            animate="visible"
            className="hover:translate-y-[-5px] transition-transform duration-300 icon my-auto px-3 py-2"
            style={{
              cursor: "pointer",
              fontFamily: "Jost",
              letterSpacing: "1.06px",
            }}
          >
            <Link href="#contact">
              <span className="text-[#64ffda]">03. </span> Contact
            </Link>
          </motion.li>
        </ul>

        <button
          onClick={() => props.setMobileMenuOpen(!props.mobileMenuOpen)}
          className="lg:hidden md:hidden w-[fit-content]"
        >
          {props.mobileMenuOpen ? (
            <X className="h-6 w-6 mr-0 ml-auto w-[fit-content]" />
          ) : (
            <Menu className="h-6 w-6 mr-0 ml-auto w-[fit-content]" />
          )}
        </button>
      </nav>
    </header>

	
        <div className={`grid place-items-center md:hidden lg:hidden transition-transform transform duration-300 overflow-y-hidden fixed top-[5em] bottom-auto z-[100] h-[100%]   bg-[#112240] shadow-lg ${props.mobileMenuOpen ? "translate-x-0" : "translate-x-[101%]"} `}>
          <nav className="mx-auto flex flex-col gap-3 px-[2em] mt-[-7em] pt-2 pb-3 space-y-1 sm:px-[2em] w-[40%] text-center">
            <Link
              href="/"
              className={`text-white hover:text-gray-900 block py-2 px-3 rounded-md text-white hover:bg-gray-50 transition-all 
                  ${pathname === "/" && " font-bold"}`}
              onClick={closeMenuOnNavigation}
            >
              Home
            </Link>
            <Link
              href="#about-me"
              className={`text-white hover:text-gray-900 block py-2 px-3 rounded-md text-white hover:bg-gray-50 transition-all 
                  ${pathname === "/#about" && "font-bold"}`}
              onClick={closeMenuOnNavigation}
            >
              About
            </Link>
            <Link
              href="#projects"
              className={`text-white hover:text-gray-900 block py-2 px-3 rounded-md text-white hover:bg-gray-50 transition-all 
                  ${pathname === "/#projecrs" && " font-bold"}`}
              onClick={closeMenuOnNavigation}
            >
              Projects
            </Link>
            <Link
              href="#contact"
              className={`text-white hover:text-gray-900 block py-2 px-3 rounded-md text-white hover:bg-gray-50 transition-all 
                  ${pathname === "/#contact-me" && "font-bold"}`}
              onClick={closeMenuOnNavigation}
            >
              Contact
            </Link>
          </nav>
        </div>
      
	</>
  );
}
