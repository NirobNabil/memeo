import { Alert, Box, Collapse, IconButton } from "@mui/material";
import React, { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import CloseIcon from "@mui/icons-material/Close";

const AlertBox = ({ show, text, severity, setShow }) => {
	return (
		<div className='fixed bottom-5 left-5 z-50'>
			<Box sx={{ width: "100%" }}>
				<Collapse in={show}>
					<Alert
						severity={severity}
						action={
							<IconButton
								aria-label='close'
								color='inherit'
								size='small'
								onClick={() => {
									setShow(false);
								}}>
								<CloseIcon fontSize='inherit' />
							</IconButton>
						}
						sx={{ mb: 2 }}>
						{text}
					</Alert>
				</Collapse>
			</Box>
		</div>
	);
};

export default AlertBox;
