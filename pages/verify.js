import React, { useEffect } from "react";
import { auth } from "../firebase";

import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../images/memex-icon.png";

export default function Verify() {
	const router = useRouter();

	useEffect(() => {
		let timeout;
		auth.onAuthStateChanged((user) => {
			console.log(user);
			if (user) {
				if (user.emailVerified) {
					router.push("/");
				} else {
					timeout = setTimeout(() => {
						router.push("/login");
					}, 3000);
					auth.signOut();
				}
			} else {
				router.push("/login");
			}
		});

		return () => clearTimeout(timeout);
	}, []);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				width: "100vw",
				display: "flex",
				flexDirection: "column",
				gap: "20px",
			}}
			className='bg-slate-200 dark:bg-slate-900'>
			<Image src={logo} alt='' className='!w-12 !h-12' />
			<h1 className='w-[600px] max-w-full dark:text-gray-400 text-gray-700 text-center text-xl'>
				Please, verify your email address to continue. We have sent the
				verification mail to your mail. Reload the page, after verification.
				<p className='mt-5'>Please wait for 3 sec. Redirecting to login page</p>
			</h1>
		</div>
	);
}
