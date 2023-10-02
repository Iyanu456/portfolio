"use client";
import React from "react";
import LinkedInImage from "./assets/icons/Linkedin.svg"
import TwitterXImage from "./assets/icons/Twitter.svg"
import Image from "next/image";
import { motion } from "framer";

export default function Home() {
	return (
		<main>
			<section className="hero grid place-items-center h-[90vh]">
				<div className="flex align-content-center justify-content-center my-auto pl-3">
					<div className="socials p-2 mr-[-2em]">
						<div><Image src={LinkedInImage} alt="Linkedin icon" /></div>
						<div><Image src={TwitterXImage} alt="X -formerly twitter icon" /></div>
					</div>
					<div className="grid place-items-center">
						<h1 className="heading-lg"><b>Hey, {`I'm`} Iyanu</b></h1>
						<p className="py-3 w-[50%] text-center">Welcome to my portfolio website! {`I'm`} passionate about technology and always eager to learn more. Whether {`it's`} coding, designing websites, or working on other projects, {`I'm`} always excited to dive in and see what I can create.</p>
					</div>
				</div>
			</section>

			<section className="grid place-items-center">
				<div>
					<h2 className="heading"><b>Technologies</b></h2>
					<div className="tecnologies-grp grid-cols-3">
						<div className="w-fit">g</div>
						<div className="w-fit">g</div>
						<div>g</div>
						<div>g</div>
					</div>
				</div>
			</section>
		</main>
	);
}
