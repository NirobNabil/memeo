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
import {
	signInWithPopup,
	GithubAuthProvider,
	GoogleAuthProvider,
	FacebookAuthProvider,
} from "firebase/auth";
import {
	signInWithEmailAndPassword,
	sendEmailVerification,
	sendPasswordResetEmail,
} from "firebase/auth";
import { ToastSuccess } from "../Components/Toast";
import { ToastError } from "../Components/Toast";
import { CircularProgress } from "@material-ui/core";

const ForgetPassWord = ({ setLoginOrRegister }) => {
	const [toastShow, setToastShow] = useState(false);
	const [toastError, setToastError] = useState(false);

	const [toastMessage, setToastMessage] = useState("");
	const [toastErrorMessage, setToastErrorMessage] = useState("");
	const [isSend, setIsSend] = useState(false);
	const [loading, setLoading] = useState(false);

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
		const { emailOrPhone } = data;
		setIsSend(true);
		setLoading(true);
		sendPasswordResetEmail(auth, emailOrPhone)
			.then(() => {
				setToastShow(true);
				setToastMessage("Password reset email sent successfully");
				setTimeout(() => {
					setToastShow(false);
					setToastMessage("");
				}, 3000);
				setLoading(false);
			})
			.catch((error) => {
				setToastError(true);
				setToastErrorMessage(error.message);
				setTimeout(() => {
					setToastError(false);
					setToastErrorMessage("");
				}, 3000);
				setLoading(false);
			});
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
						{logo && <Image src={logo} alt='Logo alt' />}
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

							<div className='forget-password-submit-email-to-reset'>
								<Button
									type='submit'
									color='primary'
									variant='contained'
									sx={{
										backgroundColor: "#ff4522",
										color: "#fff",
										"&:hover": {
											backgroundColor: "#ff4522",
										},
									}}>
									{loading ? (
										<CircularProgress color='inherit' size={20} />
									) : isSend ? (
										"Didn't receive email? Resend Again"
									) : (
										"Send email to reset password"
									)}
								</Button>
							</div>
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

						<Box sx={{ mb: 5 }} className='goto-login-form-text'>
							<button onClick={() => setLoginOrRegister("login")}>
								<a>Or, Login with email</a>
							</button>
						</Box>

						{/* <Box className='another-login-method'>
							<Flex direction='column' gap='20px'>
								<span>Or, Log in with</span>
								<Flex gap='30px' horizontal='center' vertical='center'>
									<BrandBox bg='#3b5998' onClick={signinFacebook}>
										<FaFacebookF />
									</BrandBox>
									<BrandBox bg='#db4a39' onClick={signinGoogle}>
										<FaGoogle />
									</BrandBox>
									<BrandBox bg='#171515' onClick={signinGithub}>
										<FaGithub />
									</BrandBox>
								</Flex>
							</Flex>
						</Box> */}
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

export default ForgetPassWord;
