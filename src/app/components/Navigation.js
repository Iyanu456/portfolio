"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"
import { motion } from "framer";
import menuIcon from "../assets/icons/menu-1.svg"

export default function Navigation(props) {

	const [scrollingUp, setScrollingUp] = useState(true);

	useEffect(() => {
		let prevScrollPos = window.pageYOffset;

		const handleScroll = () => {
		const currentScrollPos = window.pageYOffset;
		setScrollingUp(prevScrollPos > currentScrollPos);
		prevScrollPos = currentScrollPos;
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
		window.removeEventListener('scroll', handleScroll);
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
        <header className={`w-full grid fixed top-0 left-0 right-0 py-6 z-20 px-[2em] md:px-[3em] py-[2em] transition-transform transform duration-300 ${
        scrollingUp ? 'translate-y-0' : '-translate-y-[70%]'
      } text-white py-4`}>
				<nav className="flex">

					<motion.div
						variants={navVariants}
						initial="hidden"
						animate="visible"
						className="hover:translate-y-[-5px] transition-transform duration-300 font-bold icon border border-5 border-white my-auto border py-[0.3em] ml-0 mr-auto px-[0.5em] cursor-pointer"
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
					style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
	  					
							
								
						  <span className="text-[#05f0dc]">01. </span> About
							
						
						</motion.li>
						</Link>

						
							<motion.li
								variants={navVariants}
								initial="hidden"
								animate="visible"
								className="hover:translate-y-[-5px] transition-transform duration-300 icon my-auto px-3 py-2"
								style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
									<Link href="#projects">
								<span className="text-[#05f0dc]">02. </span> Work
								</Link>
							</motion.li>

							
							<motion.li
								variants={navVariants}
								initial="hidden"
								animate="visible"
								className="hover:translate-y-[-5px] transition-transform duration-300 icon my-auto px-3 py-2"
								style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
									<Link href="#projects">
								<span className="text-[#05f0dc]">03. </span> Contact
								</Link>
							</motion.li>
						
					</ul>

					
					<button className="w-[fit-content] grid md:hidden" onClick={() => {
							props.sidebarOpen ? props.setSidebarOpen(false) : props.setSidebarOpen(true)
							console.log("clicked on nav");
							}}><Image src={menuIcon} alt="X -formerly twitter icon" className="icon cursor-pointer  max-h-[25px] max-w-[25px]" /></button>
				</nav>
			</header>
    )
}
