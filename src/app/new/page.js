"use client"
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { ProfileImage, socials, icons, projects } from "../images";
import { motion } from "framer";

export default function () {
  return (
    <div className="min-h-[100vh]">
      <Navigation />

      <section className="md:flex hidden flex-col gap-3 fixed top-[40vh] bottom-auto left-[2em] right-auto socials p-2 mr-[-2em] w-[fit-content]">
        {socials.map(({ image, link, alt }, index) => (
          <div className="icon" key={index}>
            <Link href={link} target="blank">
              <Image src={image} alt={alt} />
            </Link>
          </div>
        ))}
      </section>

      <motion.section 
      className="grid my-auto pt-[5em] pl-[2.5em] md:pl-[12em] pr-[2em] min-h-[102vh] place-items-center"
      initial={{ opacity: 0, y: 50 }} // Start with opacity 0 and slight downward position
      animate={{ opacity: 1, y: 0 }} // Animate to full opacity and original position
      transition={{ duration: 1, ease: "easeOut" }} // Smooth transition
    >
      <motion.div 
        className="w-[fit-content] mx-auto"
        initial={{ opacity: 0, y: 50 }} // Child animation
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }} // Slight delay for better effect
      >
        <motion.h1 
          className="md:text-[4.2em]  md:w-[80%] text-[1.8em] leading-[1.3em]"
          initial={{ opacity: 0 }} // H1 fade-in effect
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
           <b>Hi
            <motion.span
              initial={{ rotate: 0 }} // Start with no rotation
              animate={{ rotate: [0, 22, -22, 22, 0] }} // Keyframes for waving motion
              transition={{
                delay: 2, // Wait 2 seconds before starting wave
                duration: 1, // Wave duration
                repeat: 1, // Repeat once (wave twice)
              }}
              className="pb-[-2.2em]"
              style={{ display: 'inline-block', originX: 0.7, originY: 0.7, width: 'fit-content' }} // Adjust origin for realistic waving
            >
              👋
            </motion.span>, {`I'm`} Iyanu
          </b>
          <br />
          <span className="text-[rgb(210,210,210)] font-semibold">
            I build things for the web.
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-[1.06m] md:w-[60%] py-3 mute leading-[1.65em]"
          initial={{ opacity: 0 }} // P fade-in effect
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          {`I’m a software engineer specializing in building (and occasionally designing) exceptional digital experiences. Currently, I’m focused on building accessible, human-centered products for startups and web3 projects.`}
        </motion.p>
      </motion.div>
    </motion.section>

    <section className="grid my-auto pt-[2em] pl-[2.5em] md:pl-[12em] pr-[2em] min-h-[102vh] place-items-center" id="about-me">
      <div className="flex flex-col md:grid md:grid-cols-[50%,30%] place-items-center gap-[2.5em]">
					<div className="my-auto">
						<div className="grid grid-cols-[13em,auto]" >
							<h3 className="heading flex w-[fit-content]"><span className="text-[#05f0dc] w-[fit-content] jost text-[0.75em] mt-[0.3em] pr-3">01. </span><b>About Me</b></h3><div className="line m-auto pr-[2em] "></div>
						</div>
						<p className="py-2">
            Hello! My name is Iyanu. I’m a passionate software engineer with a strong drive to create innovative and user-centered digital experiences. With a background in web development, I specialize in building high-quality, scalable web applications and solving complex technical challenges.
							<br /><br />
             
              Whether {`I'm`} writing code or working on web projects, I love making things that can make a positive difference. I believe that every project is a chance to learn and make the world a bit better.
            
							
							
						</p>
						
					</div>
          <div className="my-auto duration-300 transform hover:-translate-y-[0px] hover:-translate-x-[0px] transition-transform grid place-items-center relative h-[16em] w-[16em] group">
  <Image className="rounded-md z-20 absolute duration-300 transform group-hover:-translate-y-[5px] group-hover:-translate-x-[5px] transition-transform h-[16em] w-[16em]  my-auto object-cover" src={ProfileImage} alt="my profile picture" />
  <div className="rounded-md z-10 duration-200 border mt-[1em] ml-[1em] border-[2px] group-hover:-translate-y-[-5px] group-hover:-translate-x-[-5px]  border-[#05f0dc] h-[16em] w-[16em] bg-blue-500 opacity-50"></div>
</div>

					
          </div>
			</section>
    </div>
  );
}
