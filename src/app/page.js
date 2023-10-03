"use client";
import React from "react";
import LinkedInImage from "./assets/icons/Linkedin.svg"
import TwitterXImage from "./assets/icons/Twitter.svg"
import Image from "next/image";
import { motion } from "framer";

export default function Home() {
	return (
		<main>
			<section className="hero grid place-items-center w-100 h-[100vh]">
				<div className="fixed top-[40vh] bottom-[40vh] left-[2em] right-auto socials p-2 mr-[-2em] web w-10">
					<div><Image src={LinkedInImage} alt="Linkedin icon" /></div>
					<div><Image src={TwitterXImage} alt="X -formerly twitter icon" /></div>
				</div>
				<div className="grid w-[70%] my-auto pl-3">
					<h1 className="heading-lg"><b>Hi 👋, {`I'm`} Iyanu</b>
						<br /><span style={{ color: "rgb(154, 154, 154)" }}>I build things for the web</span></h1>
					<p className="py-3 w-[80%]">Welcome to my portfolio website! {`I'm`} passionate about technology and always eager to learn more. Whether {`it's`} coding, designing websites, or working on other projects, {`I'm`} always excited to dive in and see what I can create.</p>
				</div>
			</section>

			<section className="grid place-items-center w-100">
				<div className="w-[70%]">
					<h3 className="heading"><b>About Me</b></h3>
					<p>
						Hi there! I'm [Your Name], a tech enthusiast with a deep love for coding and web development. Currently, I'm on an exciting journey of self-discovery in the world of technology.
						<br />
						I'm actively learning and experimenting with React and Next.js, two powerful tools that allow me to craft visually stunning and seamlessly functioning websites. My goal is to create digital experiences that captivate and engage users.

						I'm a student at ALX, where I'm immersing myself in the world of software engineering. Each day brings new knowledge and opportunities for growth as I expand my skills in web development.

						Whether I'm writing lines of code or building web applications, I'm driven by the belief that every project is a chance to learn and make a meaningful impact. I'm passionate about creating solutions that improve lives and solve real-world problems.

						If you share my enthusiasm for technology and coding, let's connect! I'm always open to discussions about exciting projects and collaborations that push the boundaries of web development.

						Explore my portfolio to see my work in action and feel free to reach out. Together, we can bring innovative digital ideas to life.
					</p>
				</div>
			</section>
		</main>
	);
}
