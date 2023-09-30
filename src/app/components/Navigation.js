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
        <header className="py-4 px-10 m-4 drop-shadow-[10px]">
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
							animate="visible">
							Projects
						</motion.li>

						<motion.li
							variants={navVariants}
							initial="hidden"
							animate="visible">
							About Me
						</motion.li>

					</ul>
				</nav>
			</header>
    )
}