import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BrandBox, Flex } from "../../styles/global.styles";
import { CssTextField } from "../../styles/LoginOrRegister.styles";
import logo from "../../images/memex-logo-alt.png";
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
} from "@mui/material";
import { FiUser, FiLock, FiEyeOff, FiEye } from "react-icons/fi";
import { FaFacebookF, FaGoogle, FaGithub } from "react-icons/fa";
import { LoginFormContainer } from "./LoginForm.styles";
import { useForm } from "react-hook-form";

import { auth, storage, db } from "../../firebase";
import { signInWithPopup, GithubAuthProvider, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import {
signInWithEmailAndPassword,
} from "firebase/auth";
import { ToastSuccess } from "../Components/Toast";
import { ToastError } from "../Components/Toast";


const LoginForm = ({ setLoginOrRegister }) => {

	const [toastShow, setToastShow] = useState(false);
	const [toastError, setToastError] = useState(false);

	const [toastMessage, setToastMessage] = useState("");
	const [toastErrorMessage, setToastErrorMessage] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [showPassword, setShowPassword] = useState(false);

	const handleClickShowPassword = () => {
		setShowPassword((prevState) => !prevState);
	};

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const loginWithEmail = async (data) => {
		const { emailOrPhone, password } = data;
		try {
			await signInWithEmailAndPassword(auth, emailOrPhone, password)
				.then((userCredential) => {
				    	setToastMessage("Login Successful");
						setToastShow(true);
						setTimeout(() => {
							setToastShow(false);
							setToastMessage("");
						}, 3000);
				})
		} catch (error) {
			console.log(error);
			alert(error.message);
			setToastErrorMessage(error.message);
			setToastError(true);
			setTimeout(() => {
				setToastError(false);
				setToastErrorMessage("");
			}, 3000);

		}
	};

	const signinGithub = async (e) => {
		e.preventDefault();
		const provider = new GithubAuthProvider(auth);
		const result = await signInWithPopup(auth, provider);
		const credential = GithubAuthProvider.credentialFromResult(result);
		const token = credential.accessToken;
		const user = result.user;
	};

	const signinGoogle = async (e) => {
		e.preventDefault();
		const provider = new GoogleAuthProvider(auth);
		const result = await signInWithPopup(auth, provider);
		const credential = GoogleAuthProvider.credentialFromResult(result);
		const token = credential.accessToken;
		const user = result.user;
	};

	const signinFacebook = async (e) => {
		e.preventDefault();
		const provider = new FacebookAuthProvider(auth);
		const result = await signInWithPopup(auth, provider);
		const credential = FacebookAuthProvider.credentialFromResult(result);
		const token = credential.accessToken;
		const user = result.user;
	};

	return (
		<>
		<LoginFormContainer>
			<div className='login-form-container text-gray-700 '>
				<div className='logo'>
					{logo && <Image src={logo} alt='Logo alt' /> }
				</div>
				<div className='tagline'>Welcome to Memeo</div>
				<div className='login-form'>
					<form id='login' onSubmit={handleSubmit(loginWithEmail)}>
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='emailPhoneUsername'
								label='Your email, phone or username'
								variant='standard'
								type='text'
								{...register("emailOrPhone", {
									required: "Email or phone is required",
								})}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon user-icon'>
												<FiUser />
											</div>
										</InputAdornment>
									),
								}}
								error={Boolean(errors.emailOrPhone)}
								helperText={errors.emailOrPhone?.message}
							/>
						</Box>
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='password'
								label='Your password'
								variant='standard'
								type={showPassword ? "text" : "password"}
								{...register("password", {
									required: "Password is required",
								})}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon lock-icon'>
												<FiLock />
											</div>
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position='end'>
											<IconButton
												aria-label='toggle password visibility'
												onClick={handleClickShowPassword}
												onMouseDown={handleMouseDownPassword}>
												{showPassword ? <FiEyeOff /> : <FiEye />}
											</IconButton>
										</InputAdornment>
									),
								}}
								error={Boolean(errors.password)}
								helperText={errors.password?.message}
							/>
						</Box>

						{/* <Box sx={{ display: "flex", alignItems: "flex-end", mb: 1 }}>
							<FormControl>
								<FormControlLabel
									control={
										<Checkbox
											sx={{
												color: "#ff4522",
												"&.Mui-checked": {
													color: "#ff4522",
												},
											}}
											{...register("rememberMe")}
										/>
									}
									label='Remember me'
								/>
							</FormControl>
						</Box> */}

						<Button variant='contained' type='submit' sx={{ mb: 2 }}>
							Log in
						</Button>
					</form>
					{/* if password is not forgotten */}
					<Box
						sx={{ mb: 5, display: "none" }}
						className='forgot-password-text'></Box>

					<Box sx={{ mb: 5 }} className='create-new-account-text'>
						<button onClick={() => setLoginOrRegister("register")}>
							<a>Or, Create an new account</a>
						</button>
					</Box>

					<Box className='another-login-method'>
						<Flex direction='column' gap='20px'>
							<span>Or, Log in with</span>
							<Flex gap='30px' horizontal='center' vertical='center'>
								<BrandBox
									bg='#3b5998'
									onClick={signinFacebook}>
									<FaFacebookF />
								</BrandBox>
								{/* <BrandBox bg=' #00acee'>
											<FaTwitter />
										</BrandBox> */}
								<BrandBox
									bg='#db4a39'
									onClick={signinGoogle}>
									<FaGoogle />
								</BrandBox>
								<BrandBox
									bg='#171515'
									onClick={signinGithub}>
									<FaGithub />
								</BrandBox>
							</Flex>
						</Flex>
					</Box>
				</div>
			</div>
		</LoginFormContainer>
		{toastShow && (
			<div className='fixed bottom-0 right-0 m-8'>
			  <ToastSuccess text={toastMessage} />
			</div>
		  )}
	
		{toastError && (
			<div className='fixed bottom-0 right-0 m-8'>
			  <ToastError text={toastErrorMessage} />
			</div>
		  )}
		  </>
	);
};

export default LoginForm;