"use client";
import React from "react";
import LinkedInImage from "./assets/icons/Linkedin.svg"
import TwitterXImage from "./assets/icons/Twitter.svg"
import ProfileImage from "./assets/profile.jpg"
import htmlIcon from "./assets/icons/html.svg"
import cssIcon from "./assets/icons/css.svg"
import jsIcon from "./assets/icons/js.svg"
import reactIcon from "./assets/icons/react.svg"
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer";

export default function Home() {
	return (
		<main>
				{/*<script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="oyerindei1e" data-description="Support me on Buy me a coffee!" data-message="" data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script*/>
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

			<section className="grid place-items-center pb-5">
				{/*<h3 className="heading">Skills</h3>*/}
				<div className="flex gap-3 flex-wrap max-w-[68vw] grid-cols-2">
					<Image src={htmlIcon} alt="html icon" />
					<Image src={cssIcon} alt="css icon" />
					<Image src={jsIcon} alt="javascript icon" />
					<Image src={reactIcon} alt="react icon" />
				</div>
			</section>
		</main>
	);
}
