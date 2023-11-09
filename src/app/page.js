"use client";
import React from "react";
import { useState } from "react"
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar"
import Image from "next/image"
import { LinkedInImage, TwitterXImage, githubIcon, ProfileImage, icons, projects } from "./images.js"
import { motion } from "framer";

export default function Home() {

	const [sidebarOpen, setSidebarOpen] = useState(false);

	
	return (
		<>
		<Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
		<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> 
		<main>
				{/*<script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="oyerindei1e" data-description="Support me on Buy me a coffee!" data-message="" data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script>*/}
			<section className="relative z-0  top-[2em] hero grid place-items-center w-100 min-h-[100vh]">
				<div className="fixed top-[50vh] bottom-auto left-[2em] right-auto socials p-2 mr-[-2em] web w-10">
					<div className="icon"><Image src={LinkedInImage} alt="Linkedin" /></div>
					<div className="icon"><Image src={TwitterXImage} alt="X -formerly twitter" /></div>
					<div className="icon"><Image src={githubIcon} alt="X -formerly twitter" /></div>
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
						<div className="heading-grp" >
							<h3 className="heading"><b>About Me</b></h3><div className="line m-auto"></div>
						</div>
						<p className="py-4 w-auto">
							Hi, {`I'm`} <b>Iyanu</b>, and I really enjoy technology and coding. {`I'm`} currently learning how to use React and Next.js, which help me make websites that look great and work smoothly.
							<br /><br />
							{`I'm`} also a student at ALX, where {`I'm`} learning more about software engineering. {`I'm`} still in the process of learning and growing in the tech world.
							<br />
							Whether {`I'm`} writing code or working on web projects, I love making things that can make a positive difference. I believe that every project is a chance to learn and make the world a bit better.
						</p>
						
					</div>
					<Image className="max-h-[90%] max-w-[80%] max-[860px]:max-h-[55%] max-[860px]:max-w-[55%] my-auto object-cover rounded-full" src={ProfileImage} alt="my profile picture" />
				</div>
			</section>

			<section className="grid place-items-center py-[3em]">
				<h3 className="heading pb-[1em]"><b>Technologies</b></h3>
				<div className="tech-stack">
					{icons.map((item, index) => (
						<div key={index}>
							<Image src={item.icon} alt={item.alt} />
							<p className="pt-2">{item.name}</p>
						</div>)
					)}
				</div>
			</section>
			<section className="grid place-items-center w-100 py-[3em]" id="projects">
				<div className="w-[70%] max-[430px]:w-[80%] py-[2em]">
					<div className="my-auto ">
						<div className="grid place-items-center" >
							<h3 className="heading mb-4"><b>Projects</b></h3><div className="line mb-4"></div>
							{projects.map(({ name, image, description, techStack }, index) => (
								<div key={index} className="project flex gap-[2em] py-[1em] w-[100%] mb-[2em]">
								<h2 className="heading pt-1 pb-[1em] min-[930px]:hidden">{name}</h2>
									<div className="grid place-items-center">
										<Image className="object-cover max-h-[300px] max-w-[300px] rounded-[10px]" src={image} alt="project screenshot" />
									</div>
									<div>
										<h2 className="heading pt-1 pb-[1em] max-[930px]:hidden">{name}</h2>
										<div className="project-card">{description}
										</div>
										<div className="flex gap-[2em] mt-[2em] project-stack grey">
										{techStack.map((stack, index) => (
											<p key={index}>{stack}</p>
										))}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

		</main>
		</>
	);
}
