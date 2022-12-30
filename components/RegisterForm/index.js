/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import React, { useState, useRef } from "react";
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
	FormHelperText,
} from "@mui/material";
import { FiUser, FiLock, FiEyeOff, FiEye, FiMail } from "react-icons/fi";
import {
	FaFacebookF,
	FaGoogle,
	FaGithub,
	FaBirthdayCake,
	FaUserCircle,
} from "react-icons/fa";
import { SiNamebase } from "react-icons/si";
import { LoginFormContainer } from "./RegisterForm.styles";
import { useForm } from "react-hook-form";

import { auth, storage, db } from "../../firebase";
import {
	signInWithPopup,
	GithubAuthProvider,
	GoogleAuthProvider,
	FacebookAuthProvider,
	createUserWithEmailAndPassword,
	createUserWithPhoneNumber,
} from "firebase/auth";
import {
	collection,
	addDoc,
	doc,
	setDoc,
	getFirestore,
	arrayUnion,
	getDoc,
	query,
	where,
	getDocs,
	updateDoc,
	arrayRemove,
	deleteDoc,
	serverTimestamp,
	onSnapshot,
	orderBy,
	limit,
	startAfter,
	endBefore,
	startAt,
	endAt,
	increment,
	decrement,
	runTransaction,
	writeBatch,
	getDocFromCache,
} from "firebase/firestore";

import {
	ref,
	getDownloadURL,
	uploadBytesResumable,
	getStorage,
	uploadBytes,
} from "firebase/storage";

import { ToastSuccess } from "../Components/Toast";
import { ToastError } from "../Components/Toast";

const RegisterForm = ({ setLoginOrRegister }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [profileImage, setProfileImage] = useState(null);

	const [toastShow, setToastShow] = useState(false);
	const [toastError, setToastError] = useState(false);

	const [toastMessage, setToastMessage] = useState("");
	const [toastErrorMessage, setToastErrorMessage] = useState("");

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm();

	const fileInputRef = useRef(null);

	const handleClickShowPassword = () => {
		setShowPassword((prevState) => !prevState);
	};

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const checkUserName = async (username) => {
		const q = query(collection(db, "users"), where("userName", "==", username));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.size > 0) {
			return true;
		} else {
			return false;
		}
	};

	// register new user
	const registerUser = async (data) => {
		console.log(data);
		if (
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
				data.email
			)
		) {
			await createUserWithEmailAndPassword(
				auth,
				data.email,
				data.password
			).then(async (user) => {
				const storageRef = ref(storage, `photoURL/${user.user.uid}`);
				const uploadTask = await uploadBytesResumable(storageRef, profileImage);
				const downloadURL = await getDownloadURL(uploadTask.ref);

				setDoc(doc(db, "users", user.user.uid), {
					uid: user.user.uid,
					email: user.user.email,
					photoURL: profileImage ? downloadURL : "https://firebasestorage.googleapis.com/v0/b/memeo-31738.appspot.com/o/default%2Fuser.png?alt=media&token=c648e751-f267-4b21-bdc1-c51cc7d34522",
					name: data.fullName,
					createdAt: serverTimestamp(),
					userName: data.userName,
					online: true,
				})
					.then(() => {
						setDoc(
							doc(db, "users", user.user.uid, "followers", user.user.uid),
							{
								followers: [],
							}
						).catch((error) => {
							console.log(error);
							setToastError(true);
							setToastErrorMessage("Something went wrong");
							setTimeout(() => {
								setToastError(false);
								setToastErrorMessage("");
							}, 3000);
						});
						setDoc(
							doc(db, "users", user.user.uid, "following", user.user.uid),
							{
								following: arrayUnion(user.user.uid),
							}
						)
							.then(() => {
								setToastMessage("User created successfully");
								setToastShow(true);
								setTimeout(() => {
									setToastShow(false);
									setToastMessage("");
								}, 3000);
								window.location.reload();
							})
							.catch((error) => {
								console.log(error);
								setToastError(true);
								setToastErrorMessage('Something went wrong');
								setTimeout(() => {
									setToastError(false);
									setToastErrorMessage("");
								}, 3000);
							});
					})
					.catch((error) => {
						console.log(error);
						setToastError(true);
						setToastErrorMessage('Something went wrong');
						setTimeout(() => {
							setToastError(false);
							setToastErrorMessage("");
						}, 3000);
					});
			});
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
			{/* <LoginFormContainer> */}
			<div className='login-form-container text-gray-700 w-[75%] mx-auto sm:w-auto'>
				<div className='logo mb-10 pt-10'>
					{logo && <Image src={logo} alt='Logo alt' />}
				</div>
				<div className='tagline'>Welcome to Memeo</div>
				<div className='login-form'>
					<form id='login' onSubmit={handleSubmit(registerUser)}>
						{/* Full name  */}
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='name'
								label='Your full name'
								variant='standard'
								type='text'
								name='fullName'
								{...register("fullName", {
									required: "You must have to enter your name",
									maxLength: {
										value: 40,
										message: "Name must be less than 40 characters",
									},
									minLength: {
										value: 2,
										message: "Name must be more than 2 characters",
									},
								})}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon user-icon'>
												<SiNamebase />
											</div>
										</InputAdornment>
									),
								}}
								aria-invalid={errors.fullName ? "true" : "false"}
								error={Boolean(errors.fullName)}
								helperText={errors.fullName?.message}
							/>
						</Box>

						{/* User name  */}
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='userName'
								label='User name'
								variant='standard'
								name='userName'
								type='text'
								{...register("userName", {
									required: "You must have to enter user name",
									maxLength: {
										value: 40,
										message: "Name must be less than 40 characters",
									},
									minLength: {
										value: 2,
										message: "Name must be more than 2 characters",
									},
									validate: async (value) => {
										const res = await checkUserName(value);
										if (res) {
											return "User name already exists";
										}
									},
								})}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon user-icon'>
												<SiNamebase />
											</div>
										</InputAdornment>
									),
								}}
								error={Boolean(errors.userName)}
								helperText={errors.userName?.message}
							/>
						</Box>
						{/* Email or phone number  */}
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='email'
								label='Your email'
								variant='standard'
								type='text'
								name='email'
								{...register("email", {
									required: "You must have to enter your email or phone number",
									validate: (value) =>
										/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
											value
										) || /^\+?([0-9]{2})\)?([0-9]{11})$/.test(value)
											? true
											: false ||
											  "You must have to enter a valid email or phone number",
								})}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon user-icon'>
												<FiMail />
											</div>
										</InputAdornment>
									),
								}}
								error={Boolean(errors.email)}
								helperText={errors.email?.message}
							/>
						</Box>
						{/* Password  */}
						<Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='password'
								label='Your password'
								variant='standard'
								name='password'
								type={showPassword ? "text" : "password"}
								{...register("password", {
									required: "You must have to enter your password",
									pattern: {
										value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
										message:
											"Password must contain at least 8 characters, one letter and one number",
									},
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
						{/* Birthday  */}
						{/* <Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
							<CssTextField
								id='date'
								label='Birthday'
								type='date'
								variant='standard'
								{...register("birthday", {
									required: "You must have to enter your birthday",
								})}
								InputLabelProps={{
									shrink: true,
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<div className='icon lock-icon text-gray-700 '>
												<FaBirthdayCake 
											    	className="text-gray-700"
												/>
											</div>
										</InputAdornment>
									),
								}}
								error={Boolean(errors.birthday)}
								helperText={errors.birthday?.message}
							/>
						</Box> */}
						<input
							accept='image/*'
							className='hidden'
							id='contained-button-file'
							type='file'
							ref={fileInputRef}
							onChange={(e) => {
								setProfileImage(e.target.files[0]);
							}}
						/>

						<div className='flex items-center justify-between'>
							{profileImage && (
								<img
									src={URL.createObjectURL(profileImage)}
									alt='profile'
									className='w-20 h-20 rounded-full'
								/>
							)}
							<Button
								variant='contained'
								color='primary'
								onClick={() => fileInputRef.current.click()}
								sx={{ ml: 2 }}>
								Upload Profile Image
							</Button>
						</div>

						{/* <Box sx={{ display: "flex", alignItems: "flex-end", mb: 1 }}>
							<FormControl error={Boolean(errors.termsAndConditions)} required>
								<FormControlLabel
									control={
										<Checkbox
											id='termsAndConditions'
											sx={{
												color: "#ff4522",
												"&.Mui-checked": {
													color: "#ff4522",
												},
											}}
											{...register("termsAndConditions", {
												required: "You must accept the Terms and Conditions",
											})}
										/>
									}
									label='I agree to all Terms, Data Policy and Cookie Policy.'
								/>
								<FormHelperText>
									{errors.termsAndConditions?.message}
								</FormHelperText>
							</FormControl>
						</Box> */}

						<Button
							variant='contained'
							type='submit'
							sx={{
								mb: 2,
								backgroundColor: "rgb(255, 69, 34)",
								"&:hover": {
									backgroundColor: "rgb(255, 69, 34)",
									opacity: [0.9, 0.8, 0.7],
								},
							}}>
							Register
						</Button>
					</form>
					{/* if password is not forgotten */}
					<Box
						sx={{ mb: 5, display: "none" }}
						className='forgot-password-text'></Box>

					<Box sx={{ mb: 5 }} className='create-new-account-text'>
						<button onClick={() => setLoginOrRegister("login")}>
							<a>Already have an account? Log in.</a>
						</button>
					</Box>
				</div>
			</div>
			{/* </LoginFormContainer> */}
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

export default RegisterForm;
