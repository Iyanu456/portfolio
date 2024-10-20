import Image from "next/image"

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
import menuIcon from "./assets/icons/menu.svg"
import LlamaScreenshot from "./assets/icons/llama2.jpg"
import getlinkedScreenshot from "./assets/icons/getlinked.png"

const icons = [
	{
		icon: "/icons/html.svg",
		alt: "html icon",
		name: "HTML",
	},
	{
		icon: "/icons/css.svg",
		alt: "css icon",
		name: "CSS",
	},
	{
		icon: "/icons/js.svg",
		alt: "javascript icon",
		name: "JavaScript",
	},
	{
		icon: "icons/react.svg",
		alt: "react icon",
		name: "React",
	},
	{
		icon: "/icons/next.svg",
		alt: "next icon",
		name: "Next.js",
	},
	{
		icon: "/icons/tailwind.svg",
		alt: "tailwind css icon",
		name: "Tailwind",
	},
	{
		icon: "/icons/node.svg",
		alt: "node icon",
		name: "Nodejs",
	},
	{
		icon: "/icons/git.svg",
		alt: "git icon",
		name: "Git"
	},
	{
		icon: "/icons/github.svg",
		alt: "github icon",
		name: "GitHub",

	},
	{
		icon: "/icons/mysql.svg",
		alt: "mysql icon",
		name: "MySQL",
	},
	{
		icon: "/icons/figma.svg",
		alt: "git icon",
		name: "Figma",
	},
	{
		icon: "/icons/flask.svg",
		alt: "flask icon",
		name: "Flask",
	},
	]

	const projects = [
		{
			name: "SketchCV",
			description: "A user-friendly resume maker app designed to simplify the process of creating professional resumes. Sketch CV allows users to easily input their details and generate polished, ready-to-download resumes.",
			techStack: ["React + Vite", "Tailwind CSS",],
			image: "/images/sketchcv_screenshot.png",
			link: "https://resume-maker-iyanu456s-projects.vercel.app/",
			github_link: "https://github.com/Iyanu456/resume-maker",
			thumbnail: "/images/sketchcv-thumbnail.png"
		}, 
		{
			name: "LlamaGPT",
			description: "LlamaGPT is a conversational AI chatbot powered by Meta's Llama2 AI model. LlamaGPT is capable of answering questions on almost any topic",
			techStack: ["React", "Next.js", "Tailwind CSS", "Replicate API"],
			image: "/images/llama2.jpg",
			link: "https://llama-gpt.vercel.app/login",
			github_link: "https://github.com/Iyanu456/llamaGPT",
			thumbnail: "/images/llamagpt-thumbnail.png"
		},

		{
			name: "GetLinked Hackathon",
			description: "Crafted during the GetLinked pre-hackathon, this hackathon registration website mirrors a Figma design for an elegant touch.",
			techStack: ["React", "Next.js", "Tailwind CSS",],
			image: "/images/getlinked.png",
			link: "http://getlinked-hackathon-six.vercel.app/",
			github_link: "https://github.com/Iyanu456/getlinked-hackathon",
			thumbnail: "/images/getlinked-thumbnail.png"
			
		},

		{
			name: "NodePair",
			description: "Developed the landing page prototype for Nodepair, a dynamic freelance platform. ",
			techStack: ["React", "Next.js", "Tailwind CSS",],
			image: "/images/nodepair-screenshot.png",
			link: "https://landing-page-xi-jade.vercel.app/",
			github_link: "",
			thumbnail: "/images/nodepair-thumbnail.png"
			
		},

		
	]

	const socials = [
			{
				image: LinkedInImage,
				link: "https://www.linkedin.com/in/iyanuoluwa-oyerinde",
				alt: "Linkedin page",
			},

			{
				image: TwitterXImage,
				link: "https://twitter.com/iyanu_0luwa",
				alt: "Twitter/X page"
			},

			{
				image: githubIcon,
				link: "https://github.com/iyanu456",
				alt: "GitHub Repository"
			},
	]


export { Image, ProfileImage, socials, icons, projects };