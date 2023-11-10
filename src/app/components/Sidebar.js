import Image from "next/image"
import Link from "next/link";
import closeIcon from "../assets/icons/close.svg"
import { socials } from "../images"

export default function Sidebar(props) {

	function closeSidebar() {
		props.setSidebarOpen(false)
	}

	return (
		<div className={`sidebar w-[100%] mobile ${props.sidebarOpen ? "open" : null}`}>
		<div  className="mb-[2em] ml-auto mr-[1em]"><Image onClick={closeSidebar} src={closeIcon} alt="close sidebar button" className="my-auto ml-auto mr-o" /></div>

			<Link onClick={closeSidebar} href="#about-me" >
				<div className="sidebar-item" >About me</div>
			</Link>

			<Link onClick={closeSidebar} href="#projects" >
				<div className="sidebar-item" >Projects</div>
			</Link>
			<div className="absolute top-auto bottom-[1em] right-[5em]">
				{socials.map(({ image, link, alt }, index) => (
					<div className="max-h-[24px] max-w-[24px]" key={index}>
						<Link href={link} target="blank" >
							<Image src={image} alt={alt} />
						</Link>
					</div>
				))}
			</div>
		</div>
	)
}