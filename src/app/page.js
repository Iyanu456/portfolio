"use client";
import React from "react";
import LinkedInImage from "./assets/icons/Linkedin.svg"
import TwitterXImage from "./assets/icons/Twitter.svg"
import Image from "next/image";
import { motion } from "framer";

export default function Home() {
	return (
		<main>
			<section className="relative z-0  top-[2em] hero grid place-items-center w-100 h-[100vh]">
				<div className="fixed top-[50vh] bottom-auto left-[2em] right-auto socials p-2 mr-[-2em] web w-10">
					<div><Image src={LinkedInImage} alt="Linkedin icon" /></div>
					<div><Image src={TwitterXImage} alt="X -formerly twitter icon" /></div>
				</div>
				<div className="grid w-[70%] max-[430px]:w-[80%] my-auto pl-3">
					<h1 className="heading-lg"><b>Hi 👋, {`I'm`} Iyanu</b>
						<br /><span style={{ color: "rgb(154, 154, 154)" }}>I build things for the web</span></h1>
					<p className="py-3 w-[80%]">Welcome to my portfolio website! {`I'm`} passionate about technology and always eager to learn more. Whether {`it's`} coding, designing websites, or working on other projects, {`I'm`} always excited to dive in and see what I can create.</p>
				</div>
			</section>

			<section className="grid place-items-center w-100">
				<div className="w-[70%] max-[430px]:w-[80%]">
					<h3 className="heading"><b>About Me</b></h3>
					<p className="py-4 w-[80%] max-[430px]:w-[100%] ">
						Hi, {`I'm`} <b>Iyanu</b>, and I really enjoy technology and coding. {`I'm`} currently learning how to use React and Next.js, which help me make websites look great and work smoothly.
						<br /><br />
						{`I'm`} also a student at ALX, where {`I'm`} learning more about software engineering. {`I'm`}still in the process of learning and growing in the tech world.
						<br />
						Whether {`I'm`}writing code or working on web projects, I love making things that can make a positive difference. I believe that every project is a chance to learn and make the world a bit better.
						<br /><br/>If {`you're`} into tech and coding too, {`let's`} chat about some cool projects we can work on together! You can check out my portfolio to see my work.
					</p>
				</div>
			</section>
		</main>
	);
}
