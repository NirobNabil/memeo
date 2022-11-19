import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const Loading = ({ loading }) => {
	return (
		<ClipLoader color='#ff4522' loading={loading} size={50}></ClipLoader>
	);
};

export default Loading;