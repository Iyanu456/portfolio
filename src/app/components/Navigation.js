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
        <header className={`fixed top-0 left-0 right-0 py-6 z-20 px-22 transition-transform transform duration-300 ${
        scrollingUp ? 'translate-y-0' : '-translate-y-[70%]'
      } text-white py-4`}>
				<nav className="flex ml-0 mr-auto">

					<motion.div
						variants={navVariants}
						initial="hidden"
						animate="visible"
						className="my-auto py-[0.3em] px-[0.5em] cursor-pointer"
						style={{border: "1px solid rgb(156, 156, 156)",}}>
						<b>Iy</b>
					</motion.div>

					<ul className="flex ml-auto mr-0 gap-10 my-auto">
	  					<Link href="#about-me">
							<motion.li
								variants={navVariants}
								initial="hidden"
								animate="visible"
								className="web my-auto px-3 py-2"
								style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
								About me
							</motion.li>
						</Link>

						<Link href="#projects">
							<motion.li
								variants={navVariants}
								initial="hidden"
								animate="visible"
								className="web my-auto px-3 py-2"
								style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
								Projects
							</motion.li>
						</Link>
						<div onClick={() => {
							props.sidebarOpen ? props.setSidebarOpen(false) : props.setSidebarOpen(true)
							console.log("clicked on nav");
							}}><Image src={menuIcon} alt="X -formerly twitter icon" className="cursor-pointer mobile max-h-[25px] max-w-[25px]" /></div>
					</ul>
				</nav>
			</header>
    )
}
