import React from 'react'

const EmptyTeacherPage = () => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '70vh',
				textAlign: 'center', // Center-align text
			}}
		>
			<h2>
				No classes have been assigned to you yet. Once classes are
				assigned, you will be able to access the baseline. If you can't
				see the assigned classes, please log out and log back in.
			</h2>
		</div>
	)
}

export default EmptyTeacherPage
