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
		name: "Next.js",
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

	const projects = [
		{
			name: "LlamaGPT",
			description: "LlamaGPT is a conversational AI chatbot powered by Meta's Llama2 AI model. LlamaGPT is capable of answering questions on almost any topic",
			techStack: ["React", "Next.js", "Tailwind CSS", "Replicate API"],
			image: LlamaScreenshot,
		},

		{
			name: "GetLinked Hackathon Challenge",
			description: "Crafted during the GetLinked pre-hackathon, this hackathon registration website mirrors a Figma design for an elegant touch.",
			techStack: ["React", "Next.js", "Tailwind CSS",],
			image: getlinkedScreenshot,
		}
	]


export { Image, LinkedInImage, TwitterXImage, ProfileImage, githubIcon, icons, projects };