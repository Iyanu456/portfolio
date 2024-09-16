"use client";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { ProfileImage, socials, icons, projects } from "../images";
import { animate, delay, motion } from "framer-motion";

const skills = ['JavaScript', 'TypeScript', 'React', 'Nextjs', 'Tailwind', 'Nodejs', 'Express', 'Flask', 'MongoDB', 'MySQL' ]

export default function Page() {
  const aboutMeAnimation = {
    initial: {
      opacity: 0,
      y: 100,
    },

    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.4,
        ease: "easeOut",
      },
    },
  };

  const profileAnimation = {
    initial: {
      opacity: 0,
      y: 50,
    },

    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        ease: "easeOut",
      },
    },
  };

  const technologiesAnimation = {
    initial: {
      opacity: 0,
      y: 100,
    },

    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * index,
      },
    }),
  };

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
            <b>
              Hi
              <motion.span
                initial={{ rotate: 0 }} // Start with no rotation
                whileInView={{ rotate: [0, 22, -22, 22, 0] }}
                //</b>animate={{ rotate: [0, 22, -22, 22, 0] }} // Keyframes for waving motion
                transition={{
                  delay: 2, // Wait 2 seconds before starting wave
                  duration: 1, // Wave duration
                  repeat: 1, // Repeat once (wave twice)
                }}
                className="pb-[-2.2em]"
                style={{
                  display: "inline-block",
                  originX: 0.7,
                  originY: 0.7,
                  width: "fit-content",
                }} // Adjust origin for realistic waving
              >
                👋
              </motion.span>
              , {`I'm`} Iyanu
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

      <section
        className="grid my-auto pt-[2em] pl-[2.5em] md:pl-[12em] pr-[2em] min-h-[102vh] place-items-center"
        id="about-me"
      >
        <div className="flex flex-col md:grid md:grid-cols-[50%,30%] place-items-center gap-[2.7em]">
          <div className="my-auto">
            <div className="grid grid-cols-[13em,auto]">
              <h3 className="heading flex w-[fit-content]">
                <span className="text-[#05f0dc] w-[fit-content] jost text-[0.75em] mt-[0.3em] pr-3">
                  01.{" "}
                </span>
                <b>About Me</b>
              </h3>
              <div className="line m-auto pr-[2em] "></div>
            </div>
            <motion.p
              variants={aboutMeAnimation}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="py-2"
            >
              {`
              Hello! My name is Iyanu. I’m a passionate software engineer with a
              strong drive to create innovative and user-centered digital
              experiences. With a background in web development, I specialize in
              building high-quality, scalable web applications and solving
              complex technical challenges.`}
              <br />
              <br />
              Whether{" "}
              {`I'm writing code or working on web projects, I love
              making things that can make a positive difference. I believe that
              every project is a chance to learn and make the world a bit
              better.`}
            </motion.p>
            <p className="block md:hidden mb-[1.2em]">
              {`Here are a few technologies I’ve been working with recently: `} <br/><br />
              <div className="grid grid-cols-[1fr,1fr] gap-3">
                {skills.map((skill, index) => (
                  <>
                  <div key={index} className="flex gap-2 justify-center center-align">
              <div class="w-0 mx-auto my-auto h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8.66px] border-b-[#05f0dc] rotate-90"></div>
              <p>{skill}</p></div>
                  </>
                ))}
              </div>
              
            </p>
          </div>
          <motion.div
            variants={profileAnimation}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="my-auto duration-300 transform hover:-translate-y-[0px] hover:-translate-x-[0px] transition-transform grid place-items-center relative h-[10em] w-[10em] md:h-[16em] md:w-[16em] group"
          >
            <div className="grid rounded-[100%] md:rounded-md z-20 absolute duration-300 transform group-hover:-translate-y-[5px] group-hover:-translate-x-[5px] transition-transform h-[10em] w-[10em] md:h-[16em] md:w-[16em]  my-auto bg-[#05f0dc] ">
              <Image
                className="rounded-[100%] md:rounded-md object-cover  w-[100%] h-[100%] opacity-[85%] group-hover:opacity-[100%]"
                src={ProfileImage}
                alt="my profile picture"
              />
            </div>

            <div className="shadow-md rounded-[100%] md:rounded-md z-10 duration-200 border mt-[0.4em] ml-[0.4em] md:mt-[1em] md:ml-[1em] border-[2px] group-hover:-translate-y-[-5px] group-hover:-translate-x-[-5px]  border-[#05f0dc] h-[10em] w-[10em] md:h-[16em] md:w-[16em] "></div>
          </motion.div>
        </div>
      </section>

      <section className="hidden md:grid my-auto pt-[2em] pl-[2.5em] md:pl-[4em] pr-[2em] min-h-[102vh] place-items-center">
        <div className="grid place-items-center w-[fit-content] mx-auto ">
          <h3 className="mx-auto text-[2em] mb-3 text-center font-bold pb-[1em]">
            <b>Technologies</b>
          </h3>
          <div
            //viewport={{once: true}}
            className="grid grid-cols-[5em,5em,5em,5em] md:grid-cols-[8em,8em,8em,8em] gap-4 "
          >
            {icons.map((item, index) => (
              <motion.div
                whileHover={{ scale: 1.08 }}
                variants={technologiesAnimation}
                initial="initial"
                custom={index}
                whileInView="animate"
                viewport={{ once: true }}
                key={index}
                className="hover:translate-y-[-10px]  grid place-items-center w-[100%] h-[100%] md:min-h-[8em] rounded-[5px] bg-[rgba(140,140,140,0.1)] border border-[rgba(225,225,225,0.2)] shadow-[12px_20px_8px_6px_rgba(15,15,15,0.12)]  grid place-items-center p-[1.4em] cursor-pointer"
              >
                <Image
                  src={item.icon}
                  alt={item.alt}
                  width="15"
                  height="15"
                  className="max-w-[1.8em] max-h-[1.8em] md:max-h-[2.2em] md:max-w-[2.2em]"
                />
                <p className="pt-2 text-white text-center">{item.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="grid my-auto place-items-center min-h-[103vh] pt-[5em] pl-[2.5em] md:pl-[4.7em] pr-[2em] "
        id="projects"
      >
        <motion.div
          variants={aboutMeAnimation}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid my-auto w-[80%]"
        >
          <h3 className="heading flex w-[fit-content]">
            <span className="text-[#05f0dc] w-[fit-content] jost text-[0.75em] mt-[0.3em] pr-3">
              02.{" "}
            </span>
            <b>Projects</b>
          </h3>

          <div className="line m-auto pr-[2em] mb-[3em]"></div>
          <div className="flex flex-col gap-[3em]">
            {projects.map(
              ({ name, image, description, techStack, link }, index) => (
                <div key={index} className="flex gap-[2em]">
                  <h2 className="heading project-heading-mobile mb-0">
                    {name}
                  </h2>
                  <Link
                    href={link}
                    target="blank"
                    className="max-w-[360px] max-h-[240px] "
                  >
                    <Image
                      src={image}
                      className="cover max-w-[360px] max-h-[240px] rounded-md"
                      alt="project screenshot"
                      width="100"
                      height="100"
                    />
                  </Link>
                  <div>
                    <h2 className="heading pt-1 pb-[1em] project-heading-web">
                      {name}
                    </h2>
                    <div className="project-card">{description}</div>
                    <div className=" flex mt-[1em] gap-2">
                      {techStack.map((stack, index) => (
                        <div key={index} className="w-[fit-content] pr-[1.2em]">
                          {stack}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
        <motion.div
          variants={profileAnimation}
          initial="initial"
          whileInView="animate"
          //viewport={{once: true}}
          className="my-auto duration-300 transform hover:-translate-y-[0px] hover:-translate-x-[0px] transition-transform grid place-items-center relative h-[16em] w-[16em] group"
        ></motion.div>
      </section>
    </div>
  );
}
