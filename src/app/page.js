"use client";
import Header from "./components/Header";
import Image from "next/image";
import Link from "next/link";
import {
  SendHorizonal,
  Phone,
  MailOpen,
  CodeXml,
  ArrowDown,
  Eye,
} from "lucide-react";
import { ProfileImage, socials, icons, projects } from "./images";
import { animate, delay, motion } from "framer-motion";
import { useState, useEffect } from "react";
import useAxios from "@/hooks/useAxios";
import ReactCanvasConfetti from "react-canvas-confetti";
import Confetti from "./components/Confetti";
import { LoaderCircle } from "lucide-react";

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Nextjs",
  "Tailwind",
  "Nodejs",
  "Express",
  "Flask",
  "MongoDB",
  "MySQL",
];
const currentYear = new Date().getFullYear();

export default function Page() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { loading, error, sendRequest } = useAxios();
  const [errorMessage, setErrorMessage] = useState("");

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsLargeScreen(window.innerWidth >= 1024);
      };

      // Set the initial screen size
      handleResize();

      // Add event listener on component mount
      window.addEventListener("resize", handleResize);

      // Remove event listener on component unmount
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const SendMail = async (e) => {
    e.preventDefault();

    if (name === "" || email === "" || message === "") {
      console.error("Name, email, or message is missing");
      return;
    }

    try {
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/send_mail/`,
        method: "POST",
        body: { name, email, message },
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": `${process.env.NEXT_PUBLIC_SECRET_KEY}`,
        },
      });

      if (response.ok) {
        console.log("email sent successfully");
        setIsVisible(true);
        // Set a timeout to hide the item after 4 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 8000); // 4000 milliseconds = 4 seconds
      }
    } catch (error) {
      //console.error(error);
      setErrorMessage("An error occurred please try again");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
  };

  const about_me_animation = {
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

  const profile_animation = {
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

  const technologies_animation = {
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

  const tech_stack_animation = {
    initial: {
      opacity: 0,
      y: 100,
    },

    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4 * index,
        duration: 0.7,
      },
    }),
  };

  const contact_me_animation = {
    initial: {
      opacity: 0,
      y: 50,
    },

    animate: () => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 1.1,
      },
    }),
  };

  return (
    <div className={`grid min-h-[100vh]`}>
      <section className="md:flex hidden flex-col gap-3 fixed top-[40vh] bottom-auto left-[2em] right-auto socials p-2 mr-[-2em] w-[fit-content]">
        {socials.map(({ image, link, alt }, index) => (
          <div className="icon" key={index}>
            <Link href={link} target="blank">
              <Image
                className="min-w-[25px] min-h-[25px]"
                src={image}
                width={30}
                height={30}
                alt={alt}
              />
            </Link>
          </div>
        ))}
      </section>

      <motion.section
        className="grid my-auto md:pt-[5em] lg:max-w-[90em] mx-auto px-[2em] md:pl-[12em] md:min-h-[102vh] max-sm:min-h-[102vh] sm:min-h-[102vh] place-items-center"
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
            className="lg:text-[4.2em] md:text-[3em] tablet:text-[3.2em]  md:w-[80%] lg:w-[85%] text-[1.8em] leading-[1.3em]"
            initial={{ opacity: 0 }} // H1 fade-in effect
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <b className="text-[#d4dbf5]">
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
            <span className="text-[#a2adcf] font-semibold">
              I build things for the web.
            </span>
          </motion.h1>

          {/*Gradient div */}
          {/*<div className="absolute z-[-10] inset-0  bg-[radial-gradient(circle,_#17318a_0%,_rgba(7,18,34,1)_100%)]"></div>*/}

          <motion.p
            className="mb-[2em] text-[1.06m] text-[#a7b2d4]  md:w-[60%] py-3 mute leading-[1.65em]"
            initial={{ opacity: 0 }} // P fade-in effect
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          >
            {`I’m a software engineer specializing in building (and occasionally designing) exceptional digital experiences. Currently, I’m focused on building accessible, human-centered products for startups and web3 projects.`}
          </motion.p>
            <div className="mt-[2em]" >
            <a
      href="/Iyanuoluwa Resume.pdf"
      download="Iyanuoluwa Resume.pdf"
      className="mt-[2em] px-[1.2em] py-4 font-semibold shadow-md max-sm:w-[fit-content] lg:w-[fit-content] rounded-md bg-cyan-600 text-white"
    >
      Download Resume
    </a></div>
        </motion.div>
        <Link
          href={"#about-me"}
          className="floating-arrow absolute z-[120] right-auto left-auto tablet:hidden sm:left-[50vw] bottom-[2em] top-auto lg:hidden"
        >
          <ArrowDown color="#ccd6f6" size={30} />
        </Link>
      </motion.section>

      <div className="relative">
        {/*Gradient div */}
        {/*<div className="absolute z-[-11] top-auto right-auto left-auto bottom-0 h-[108.1%] w-[100%]  bg-[transparent] inner-shadow inset-0"></div>*/}
        <section
          className="max-sm:mb-[4em]  sm:py-[3em] max-sm:py-[3em]  grid my-auto md:pt-[-3em] pl-[2em] pr-[2em] md:pr-[8em] tablet:pr-[8em] md:pl-[12em] lg:max-w-[90em] mx-auto min-h-[102vh] place-items-center "
          id="about-me"
        >
          <div className="flex flex-col lg:grid md:grid-cols-[50%,30%] place-items-center gap-[2.7em] tablet:flex tablet:flex-col ">
            <div className="my-auto">
              <div className="grid md:grid-cols-[13em,auto] grid-cols-[10.5em,auto]">
                <h3 className="heading md:text-[1.8em] text-[1.5em] flex w-[fit-content] my-auto">
                  <span className="text-[#05f0dc] w-[fit-content] jost text-[0.75em] md:mt-[0.3em] mt-[0.4em] pr-3">
                    01.{" "}
                  </span>
                  <b className="text-[#ccd6f6]">About Me</b>
                </h3>
                <div className="line m-auto pr-[2em] "></div>
              </div>

              <div className="my-[1.5em] mt-[1.6em] md:hidden mx-auto duration-300 transform hover:-translate-y-[0px] hover:-translate-x-[0px] transition-transform grid place-items-center relative h-[10em] w-[10em] md:h-[16em] md:w-[16em] group">
                <div className="grid rounded-[100%] md:rounded-md z-20 absolute duration-300 transform group-hover:-translate-y-[5px] group-hover:-translate-x-[5px] transition-transform h-[10em] w-[10em] md:h-[16em] md:w-[16em]  my-auto bg-[#05f0dc] ">
                  <Image
                    className="rounded-[100%] md:rounded-md object-cover  w-[100%] h-[100%] opacity-[85%] group-hover:opacity-[100%]"
                    src={ProfileImage}
                    alt="my profile picture"
                  />
                </div>

                <div className="max-sm:hidden shadow-md rounded-[100%] md:rounded-md z-10 duration-200 border mt-[0.4em] ml-[0.4em] md:mt-[1em] md:ml-[1em] border-[2px] group-hover:-translate-y-[-5px] group-hover:-translate-x-[-5px]  border-[#05f0dc] h-[10em] w-[10em] md:h-[16em] md:w-[16em] "></div>
              </div>
              <motion.p
                variants={about_me_animation}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="py-2"
              >
                {`
              Hello! My name is Iyanu. I’m a passionate software engineer with a
              strong drive to create innovative and user-centered digital
              experiences. With a background in software engineering, I specialize in
              building high-quality, scalable applications and solving
              complex technical challenges.`}
                <br />
                <br />
                Whether{" "}
                {`I'm writing code or working on web projects, I love
              making things that make a positive difference. I believe that
              every project is a chance to learn and make the world a bit
              better.`}
              </motion.p>
              <motion.div
                variants={about_me_animation}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="block md:hidden mb-[1.2em]"
              >
                {`Here are a few technologies I’ve been working with recently: `}{" "}
                <br />
                <br />
                <div className="grid grid-cols-[1fr,1fr] gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex gap-2 justify-center center-align"
                    >
                      <div className="w-0 mx-auto my-auto h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8.66px] border-b-[#05f0dc] rotate-90"></div>
                      <p>{skill}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <motion.div
              variants={profile_animation}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="max-sm:hidden sm:hidden md:block  my-auto duration-300 transform hover:-translate-y-[0px] hover:-translate-x-[0px] transition-transform grid place-items-center relative h-[10em] w-[10em] md:h-[16em] md:w-[16em] group"
            >
              <div className="grid rounded-[100%] md:rounded-md z-20 absolute duration-300 transform group-hover:-translate-y-[5px] group-hover:-translate-x-[5px] transition-transform h-[10em] w-[10em] md:h-[16em] md:w-[16em]  my-auto bg-[#05f0dc] ">
                <Image
                  className="rounded-[100%] md:rounded-md object-cover  w-[100%] h-[100%] opacity-[85%] group-hover:opacity-[100%]"
                  src={ProfileImage}
                  alt="my profile picture"
                />
              </div>

              <div className="max-sm:hidden shadow-md rounded-[100%] md:rounded-md z-10 duration-200 border mt-[0.4em] ml-[0.4em] md:mt-[1em] md:ml-[1em] border-[2px] group-hover:-translate-y-[-5px] group-hover:-translate-x-[-5px]  border-[#05f0dc] h-[10em] w-[10em] md:h-[16em] md:w-[16em] "></div>
            </motion.div>
          </div>
        </section>
      </div>

      <section className="hidden md:grid my-auto pt-[2em] pl-[2em] md:pl-[4em] pr-[2em] md:min-h-[102vh] place-items-center">
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
                variants={technologies_animation}
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
        className="max-sm:grid sm:mt-[3em] my-auto pt-[2em] px-[2em] md:pl-[12em] md:pr-[5em]  min-h-[90vh] md:place-items-center lg:max-w-[93em] mx-auto"
        id="projects"
      >
        <div
          id="projects"
          className="flex flex-col gap-3 md:max-w-[85%] max-sm:max-w[100%]"
        >
          <div className="grid md:grid-cols-[13em,auto] grid-cols-[9em,auto] mb-[1.7em]">
            <h3 className="heading md:text-[1.8em] text-[1.5em] flex w-[fit-content] my-auto">
              <span className="text-[#05f0dc] w-[fit-content] jost text-[0.75em] md:mt-[0.3em] mt-[0.4em] pr-3">
                03.{" "}
              </span>
              <b>Projects</b>
            </h3>
            <div className="line m-auto pr-[2em]"></div>
          </div>
          {projects.map(
            (
              {
                name,
                image,
                description,
                techStack,
                link,
                github_link,
                thumbnail,
              },
              index
            ) => (
              <div key={index}>
                <motion.div
                  variants={tech_stack_animation}
                  initial="initial"
                  custom={index}
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="relative md:grid max-sm:mx-auto flex flex-col tablet:flex-col lg:grid-cols-[34%,56%] gap-2 md:gap-[2em] lg:gap-[3.4em] mb-[3em] rounded-[2em]"
                >
                  <div className="hidden tablet:hidden lg:block relative overflow-hidden rounded-[2em]">
                    <Link
                      href={link}
                      target="blank"
                      className=" w-[85%] tablet:w-[100%] max-sm:w-[100%]"
                    >
                      <Image
                        src={image}
                        className="object-cover w-[100%] tablet:w-[100%] tablet:pt-[0.1em] pt-[0.1em] lg:h-[18em] tablet:h-[22em] sm:h-[18em] h-[22em] transition hover:scale-[1.1] duration-200 lg:max-w-[22em]  rounded-md tablet:shadow-lg"
                        alt="project screenshot"
                        width="100"
                        height="100"
                        unoptimized="true"
                      />
                    </Link>
                    {/*<div class="lg:hidden absolute inset-0 bg-black opacity-[90%] bg-[rgba(10,24,46,0.91)] "></div>
                    <div class="lg:hidden absolute inset-0 bg-[rgba(10,24,46,0.91)] lg:bg-[transparent]"></div>*/}
                  </div>
                  <div className="relative grid">
                    <div
                      style={{
                        background: `url(${isLargeScreen ? "" : thumbnail})`,
                        position: "center",
                        objectFit: "cover",
                      }}
                      className="relative my-auto rounded-[2em]  flex flex-col tablet:flex :flex tablet:flex-col  justify-center  center-align  lg:relative h-[fit-content] tablet:px-[2em] px-[2em]  py-[2em] lg:px-0 lg:py-0"
                    >
                      <h2 className=" lg:text-[1.8em] tablet:text-[1.5em] text-[1.3em] md:mb-4 mb-2 font-semibold">
                        {name}
                      </h2>
                      <div className="project-card">{description}</div>
                      <div className="mt-4 inline-flex leading-[0.7em] mb-3 flex-wrap gap-[1.5em]">
                        {techStack.map((item, index) => (
                          <p
                            className="w-[fit-content] text-[#05f0dc]"
                            key={index}
                          >
                            {item}
                          </p>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-4">
                        {link && link != "" && (
                          <Link
                            href={link}
                            target="blank"
                            className="px-5 py-2 w-[fit-content] bg-cyan-900 rounded-md flex gap-3"
                          >
                            <Eye className="w-[fit-content] my-auto" /> Live
                          </Link>
                        )}
                        {github_link && github_link != "" && (
                          <Link
                            href={github_link}
                            target="blank"
                            className="px-5 py-2 w-[fit-content] bg-cyan-900 rounded-md flex gap-3"
                          >
                            <CodeXml className="w-[fit-content] my-auto" />{" "}
                            Source{" "}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )
          )}
        </div>
      </section>

      <motion.section
        variants={contact_me_animation}
        initial="initial"
        whileInView="animate"
        className="max-sm:mb-0 max-sm:min-h-[90vh] mb-[6em] mt-[10em] sm:mt-[5em] max-sm:mt-[2em] md:pl-[12em] max-sm:px-[2em] sm:px-[2em] sm:text-center max-sm:text-center  grid max-sm:place-items-center tablet:grid-cols-[1.25fr,1fr] lg:grid-cols-[0.8fr,1fr] gap-[3em]  lg:max-w-[100em] mx-auto"
        id="contact"
      >
        <div className="center-align flex justify-center gap-4">
          <form
            onSubmit={SendMail}
            className="flex flex-col  gap-4 max-sm:w-[100%] md:max-w-[80%]  max-sm:flex-col"
          >
            <h3 className="mb-2 md:text-[2em] sm:text-[1.8em] max-sm:text-[1.6em] mx-auto font-semibold ">
              {`Let's get in touch`}
            </h3>

            <input
              type="text"
              placeholder="Name / Organization"
              className=" rounded-lg border border-gray-600 bg-[rgba(10,24,46,0.897)] p-2 pl-4 text-white placeholder-gray-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email - example@example.com"
              className=" rounded-lg border border-gray-600 bg-[rgba(10,24,46,0.897)] p-2 pl-4 text-white placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <textarea
              placeholder="Write me a message!"
              className="h-60 rounded-lg border border-gray-600 bg-[rgba(10,24,46,0.897)] p-2 pl-4 text-white placeholder-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
            {errorMessage !== "" && (
              <p className="max-sm:text-left">{errorMessage}</p>
            )}
            {isVisible && <p className="max-sm:text-left">Message sent!</p>}
            <button className="flex justify-center center-align gap-3 px-[1.2em] py-4 font-semibold shadow-md max-sm:w-[fit-content] lg:w-[fit-content] rounded-md bg-cyan-600 text-white">
              Send message{" "}
              {loading ? (
                <LoaderCircle className="w-[fit-content] my-auto rotating-svg" />
              ) : (
                <SendHorizonal className="w-[fit-content] my-auto" />
              )}
            </button>
            {isVisible && <Confetti />}
          </form>
        </div>
      </motion.section>
    </div>
  );
}
