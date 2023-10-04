"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer";

export default function Navigation() {

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
						style={{border: "1px solid rgb(156, 156, 156)", padding: "0.2em 0.5em"}}>
						<b>Iy</b>
					</motion.div>

					<ul className="flex ml-auto mr-0 gap-10 web">
	  					<Link href="#about-me">
							<motion.li
								variants={navVariants}
								initial="hidden"
								animate="visible"
								style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
								About me
							</motion.li>
						</Link>

						<motion.li
							variants={navVariants}
							initial="hidden"
							animate="visible"
							style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
							Projects
						</motion.li>

					</ul>
				</nav>
			</header>
    )
}
