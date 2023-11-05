import Image from "next/image"
import closeIcon from "../assets/icons/close.svg"

export default function Sidebar(props) {
	return (
		<div className={`sidebar w-[100%] mobile ${props.sidebarOpen ? "open" : null}`}>
		<div  className="mb-[2em] ml-auto mr-[1em]"><Image onClick={() => props.setSidebarOpen(false)} src={closeIcon} alt="close sidebar button" className="my-auto ml-auto mr-o" /></div>
			<div className="sidebar-item">About me</div>
			<div className="sidebar-item">Projects</div>
		</div>
	)
}