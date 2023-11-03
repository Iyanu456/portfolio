"use client";
import React from "react";
import LinkedInImage from "./assets/icons/Linkedin.svg"
import TwitterXImage from "./assets/icons/Twitter.svg"
import ProfileImage from "./assets/profile.jpg"
import htmlIcon from "./assets/icons/html.svg"
import cssIcon from "./assets/icons/css.svg"
import jsIcon from "./assets/icons/js.svg"
import reactIcon from "./assets/icons/react.svg"
import nextIcon from "./assets/icons/next.svg"
import tailwindIcon from "./assets/icons/tailwind.svg"
import githubIcon from "./assets/icons/github.svg"
import nodeIcon from "./assets/icons/node.svg"
import gitIcon from "./assets/icons/git.svg"
import flaskIcon from "./assets/icons/flask.svg"
import figmaIcon from "./assets/icons/figma.svg"
import mysqlIcon from "./assets/icons/mysql.svg"
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer";

export default function Home() {

	const icons = [
	{
		icon: htmlIcon,
		alt: "html icon",
		name: "HTML",
	},
	{
		icon: cssIcon,
		alt: "css icon",
		name: "CSS",
	},
	{
		icon: jsIcon,
		alt: "javascript icon",
		name: "JavaScript",
	},
	{
		icon: reactIcon,
		alt: "react icon",
		name: "React",
	},
	{
		icon: nextIcon,
		alt: "next icon",
		name: "Nextjs",
	},
	{
		icon: tailwindIcon,
		alt: "tailwind css icon",
		name: "Tailwind",
	},
	{
		icon: nodeIcon,
		alt: "node icon",
		name: "Nodejs",
	},
	{
		icon: gitIcon,
		alt: "git icon",
		name: "Git"
	},
	{
		icon: githubIcon,
		alt: "github icon",
		name: "GitHub",

	},
	{
		icon: mysqlIcon,
		alt: "mysql icon",
		name: "MySQL",
	},
	{
		icon: figmaIcon,
		alt: "git icon",
		name: "Figma",
	},
	{
		icon: flaskIcon,
		alt: "flask icon",
		name: "Flask",
	},
	]
	return (
		<main>
				{/*<script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="oyerindei1e" data-description="Support me on Buy me a coffee!" data-message="" data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script>*/}
			<section className="relative z-0  top-[2em] hero grid place-items-center w-100 min-h-[100vh]">
				<div className="fixed top-[50vh] bottom-auto left-[2em] right-auto socials p-2 mr-[-2em] web w-10">
					<div><Image src={LinkedInImage} alt="Linkedin icon" /></div>
					<div><Image src={TwitterXImage} alt="X -formerly twitter icon" /></div>
				</div>
				<div className="grid w-[70%] max-[430px]:w-[80%] my-auto">
					<h1 className="heading-lg"><b>Hi 👋, {`I'm`} Iyanu</b>
						<br /><span style={{ color: "rgb(154, 154, 154)" }}>I build things for the web.</span></h1>
					<p className="py-3 w-[80%]">Welcome to my portfolio website! {`I'm`} passionate about technology and always eager to learn more. Whether {`it's`} coding, designing websites, or working on other projects, {`I'm`} always excited to dive in and see what I can create.</p>
				</div>
			</section>

			<section className="grid place-items-center w-100 min-h-[100vh]" id="about-me">
				<div className="about-me-grid w-[70%] max-[430px]:w-[80%] py-4">
					<div className="my-auto ">
						<h3 className="heading"><b>About Me</b></h3>
						<p className="py-4 w-auto">
							Hi, {`I'm`} <b>Iyanu</b>, and I really enjoy technology and coding. {`I'm`} currently learning how to use React and Next.js, which help me make websites that look great and work smoothly.
							<br /><br />
							{`I'm`} also a student at ALX, where {`I'm`} learning more about software engineering. {`I'm`} still in the process of learning and growing in the tech world.
							<br />
							Whether {`I'm`} writing code or working on web projects, I love making things that can make a positive difference. I believe that every project is a chance to learn and make the world a bit better.
						</p>
						
					</div>
					<Image className="max-h-[90%] max-w-[80%] my-auto object-cover rounded-full" src={ProfileImage} alt="my profile picture" />
				</div>
			</section>

			<section className="grid place-items-center pb-5 min-h-[100vh]">
				<h3 className="heading"><b>Technologies</b></h3>
				<div className="tech-stack">
					{icons.map((item, index) => (
						<div key={index}>
							<Image src={item.icon} alt={item.alt} />
							<p>{item.name}</p>
						</div>)
					)}
				</div>
			</section>
		</main>
	);
}
