import React, { useState, useEffect } from "react";

function Switches(props) {
	const { checked, setChecked } = props;
	return (
		<div className='switchdiv'>
			<div className='flexrow switchdiv'>
				<p>{props.title}</p>
				<label className='form-switch'>
					<input
						type='checkbox'
						checked={checked}
						onChange={() => setChecked(!checked)}
					/>
					<i></i>
				</label>
			</div>
		</div>
	);
}
export default Switches;
