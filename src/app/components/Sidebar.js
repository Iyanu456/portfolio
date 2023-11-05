import Image from "next/image"
import Link from "next/link";
import closeIcon from "../assets/icons/close.svg"

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
		</div>
	)
}