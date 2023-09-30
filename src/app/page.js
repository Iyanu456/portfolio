"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer";

export default function Home() {
	return (
		<main>
			<section>
				<div className="grid place-items-center h-[70vh]">
          <Image src={""} />
					<p className="text-2xl m-auto w-[70%]">Hi {`I'm`} Iyanu. Welcome to my portfolio website! {`I'm`} passionate about technology and always eager to learn more. Whether {`it's`} coding, designing websites, or working on other projects, {`I'm`} always excited to dive in and see what I can create.</p>
				</div>
			</section>
		</main>
	);
}
