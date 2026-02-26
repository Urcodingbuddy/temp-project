import { Box } from '@mui/system'
import { useState } from 'react'
import TeachingAttitudeTab from './TeachingAttitudeTab'
import { Tab, Tabs } from '@mui/material'
import { studentCopeStyles } from '../../StudentCope/StudentCopeStyles'
import TeachingPracticesTab from './TeachingPracticesTab'
import JobLifeSatisfactionTab from './JobLifeSatisfactionTab'
import DiscProfilesContentTab from './DiscProfilesContentTab'

const AssessmentFormTab = ({
	isEditable,
	isDISCSelected,
	isTeachingPracticesSelected,
	isJobLifeSatisfactionSelected,
	isTeachingAttitudeSelected,
}) => {
	const tabs = [
		isTeachingAttitudeSelected && {
			label: 'Teaching Attitudes',
			value: 'teachingAttitudes',
		},
		isTeachingPracticesSelected && {
			label: 'Teaching Practices',
			value: 'teachingPractices',
		},
		isJobLifeSatisfactionSelected && {
			label: 'Job-Life Satisfaction',
			value: 'jobLifeSatisfaction',
		},
		isDISCSelected && { label: 'DISC Profiles', value: 'discProfiles' },
	].filter(Boolean) // Filter out undefined values

	// Set default selectedTab based on the first tab in the list
	const [selectedTab, setSelectedTab] = useState(tabs[0]?.value || '')

	const handleTabChange = (event, newValue) => {
		setSelectedTab(newValue)
	}
	const renderTabContent = (tabValue) => {
		switch (tabValue) {
			case 'teachingAttitudes':
				return <TeachingAttitudeTab isEditable={isEditable} />
			case 'teachingPractices':
				return <TeachingPracticesTab isEditable={isEditable} />
			case 'jobLifeSatisfaction':
				return <JobLifeSatisfactionTab isEditable={isEditable} />
			case 'discProfiles':
				return <DiscProfilesContentTab isEditable={isEditable} />
			default:
				return null
		}
	}

	return (
		<>
			<Box
				sx={{
					...studentCopeStyles?.questionBoxSx,
					mt: '20px',
				}}
			>
				<Tabs
					value={selectedTab}
					onChange={handleTabChange}
					TabIndicatorProps={{ style: { display: 'none' } }}
				>
					{tabs.map((tab, index) => (
						<Tab
							sx={{
								backgroundColor: '#013C7E',
								color: 'white',
								mr: '4px',
								borderRadius: '10px',
								'&.Mui-selected': {
									backgroundColor: '#0267D9',
									color: 'white',
								},
							}}
							key={tab.value}
							label={tab.label}
							value={tab.value}
						/>
					))}
				</Tabs>
				<Box>{renderTabContent(selectedTab)}</Box>
			</Box>
		</>
	)
}

export default AssessmentFormTab
