"use client"
import { motion } from "framer";

export default function Navigation() {
    const navVariants = {
		hidden: {
			opacity: 0,
		},
		visible: {
			opacity: 1,
		},
	};
    return (
        <header className="fixed top-0 left-0 right-0 py-6 px-22">
				<nav className="flex ml-0 mr-auto">

					<motion.div
						variants={navVariants}
						initial="hidden"
						animate="visible">
						logo
					</motion.div>

					<ul className="flex ml-auto mr-0 gap-10">

						<motion.li
							variants={navVariants}
							initial="hidden"
							animate="visible"
							style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
							Projects
						</motion.li>

						<motion.li
							variants={navVariants}
							initial="hidden"
							animate="visible"
							style={{cursor: "pointer", fontFamily: "Jost", letterSpacing: "1.06px"}}>
							About Me
						</motion.li>

					</ul>
				</nav>
			</header>
    )
}