import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BrandBox, Flex, Grid } from "../../styles/global.styles";
import { LoginWrapper } from "../../styles/LoginOrRegister.styles";
import Loading from "../../components/Loading";
import LoginForm from "../../components/loginForm";
import RegisterForm from "../../components/RegisterForm";

import { auth } from "../../firebase";

const LoginOrRegister = () => {
	const router = useRouter();
	const [loginOrRegister, setLoginOrRegister] = useState("login");
    const [loading, setLoading] = useState(true);
    const [isLogged, setIsLogged] = useState(false);

	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			if (user) {
				setIsLogged(true);
				setLoading(false);
				router.push("/");
			} else {
				setIsLogged(false);
				setLoading(false);
			}
		});
	}, []);

   
	

	if (loading) {
		return (
			<div 
			className="justify-center flex flex-col h-screen  items-center"
			>
				<Loading loading={true} />
			</div>
		);
	}

	return (
		<LoginWrapper>
			<Grid columns='3fr 2fr' className='loginwrapper_container' gap='0'>
				<div className='login-banner'>
					<Flex
						direction='column'
						horizontal='space-between'
						vertical='space-between'>
						{/* <div className='login-banner-title'>
							<p>
								Make your day <br /> <span>Happy</span> <br /> With MEME
							</p>
						</div>
						<div className='login-banner-subtitle'>
							<p>
								Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vitae
								reprehenderit doloremque magni error maxime quibusdam tenetur
								perferendis in temporibus voluptates, autem ducimus aliquid
								itaque voluptatum. Exercitationem esse vel dolore eum?
							</p>
						</div> */}
					</Flex>
				</div>
				<Flex horizontal='center' vertical='center'>
					{loginOrRegister === "login" && (
						<LoginForm setLoginOrRegister={setLoginOrRegister} />
					)}
					{loginOrRegister === "register" && (
						<RegisterForm setLoginOrRegister={setLoginOrRegister} />
					)}
				</Flex>
			</Grid>
		</LoginWrapper>
	);
};

export default LoginOrRegister;