import React from 'react'
import PlacementWithSend from './PlacementWithSend'
import { Box } from '@mui/material'
import useCommonStyles from '../../../components/styles'
import { IEPContentsList, checklistHeaders } from './iEPConstants'
import CustomCollapsibleComponent from '../../../components/CustomCollapsibleComponent'
import { useState } from 'react'
import { useCallback } from 'react'
import BaselineCategoryIEP from './BaselineCategoryIEP'
import ChecklistData from './ChecklistData'
import Evolution from './Evolution '
import AccFromBoard from './AccFromBoard'
import InternalAccomodation from './AccInternal'
import TransitionPlanning from './TransitionPlanning'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useEffect } from 'react'
import { ValidationCheckforAddIEP } from './iEPFunctions'

const IEPForm = ({
	addIEPData,
	setAddIEPData,
	studentBaselineReport,
	readOnly = false,
	isBaselineExist,
	setIsBtnDisabled,
}) => {
	const flexStyles = useCommonStyles()
	const [modal, setModal] = useState({
		0: false,
		1: false,
		2: false,
		3: false,
		4: false,
		5: false,
		6: false,
	})
	const handleModal = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModal((state) => ({ ...state, ...obj }))
	}, [])

	const [variants, setVariants] = useState({})
	useEffect(() => {
		const obj = {} // Ensure obj is defined

		studentBaselineReport?.additionalNeeds?.forEach((data) => {
			obj[data.categoryName?.trim()] = data?.Criticality
		})
		setVariants(obj)
		if (
			studentBaselineReport?.checklistForm?.length > 0 &&
			addIEPData?.checkList?.length === 0
		) {
			const listData = checklistHeaders(
				studentBaselineReport?.checklistForm,
			)?.map((d) => ({
				category: d?.trim(),
				shortTermGoal: [],
				longTermGoal: [],
			}))
			setAddIEPData({ ...addIEPData, checkList: listData })
		}
	}, [studentBaselineReport])

	useEffect(() => {
		const isAnyEmpty = ValidationCheckforAddIEP(
			addIEPData,
			isBaselineExist,
			variants,
		)
		setIsBtnDisabled(!isAnyEmpty)
	}, [addIEPData])

	return (
		<div>
			<Box className={flexStyles.flexColumn} gap={'20px'}>
				{IEPContentsList.map((category, index) => {
					return (
						<Box sx={{ mt: '20px' }}>
							<CustomCollapsibleComponent
								open={modal[index]}
								title={category}
								onClick={() =>
									handleModal(index, !modal[index])
								}
								titleSx={{ fontSize: '16px' }}
							>
								{index === 0 && (
									<BaselineCategoryIEP
										data={
											studentBaselineReport?.baselinePerformance ??
											{}
										}
										comments={addIEPData?.baselineComments}
										setComments={(title, data) =>
											setAddIEPData({
												...addIEPData,
												baselineComments: {
													...addIEPData.baselineComments,
													[title]: data,
												},
											})
										}
										readOnly={readOnly}
										isBaselineExist={isBaselineExist}
									/>
								)}
								{index === 1 && (
									<ChecklistData
										checklistData={addIEPData?.checkList}
										onChange={(data) => {
											setAddIEPData({
												...addIEPData,
												checkList: data,
											})
										}}
										readOnly={readOnly}
										variants={variants}
									/>
								)}
								{index === 2 ? (
									<Evolution
										data={addIEPData.Evolution}
										onChange={(data) => {
											if (
												JSON.stringify(
													addIEPData?.Evolution,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													Evolution: data,
												})
											}
										}}
										setComments={(data) => {
											if (
												JSON.stringify(
													addIEPData?.Evolution?.[
														localizationConstants
															.comments
													],
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													Evolution: {
														...addIEPData.Evolution,
														[localizationConstants.comments]:
															data,
													},
												})
											}
										}}
										readOnly={readOnly}
									/>
								) : null}

								{index === 3 && (
									<AccFromBoard
										data={
											addIEPData?.AccommodationFromBoard ??
											{}
										}
										onChange={(data) => {
											if (
												JSON.stringify(
													addIEPData?.AccommodationFromBoard,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													AccommodationFromBoard:
														data,
												})
											}
										}}
										readOnly={readOnly}
									/>
								)}

								{index === 4 ? (
									<InternalAccomodation
										data={addIEPData.internalAccommodation}
										onChange={(data) => {
											if (
												JSON.stringify(
													addIEPData?.internalAccommodation,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													internalAccommodation: data,
												})
											}
										}}
										setComments={(title, data) => {
											if (
												JSON.stringify(
													addIEPData
														?.internalAccommodation?.[
														title
													]?.comments,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													internalAccommodation: {
														...addIEPData.internalAccommodation,
														[title]: {
															...addIEPData
																?.internalAccommodation?.[
																title
															],
															comments: data,
														},
													},
												})
											}
										}}
										readOnly={readOnly}
									/>
								) : null}

								{index === 5 ? (
									<TransitionPlanning
										data={addIEPData.TransitionPlanning}
										onChange={(data) => {
											if (
												JSON.stringify(
													addIEPData?.TransitionPlanning,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													TransitionPlanning: data,
												})
											}
										}}
										setComments={(title, data) => {
											if (
												JSON.stringify(
													addIEPData
														?.TransitionPlanning?.[
														title
													]?.comments,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													TransitionPlanning: {
														...addIEPData.TransitionPlanning,
														[title]: {
															...addIEPData
																?.TransitionPlanning?.[
																title
															],
															comments: data,
														},
													},
												})
											}
										}}
										readOnly={readOnly}
									/>
								) : null}

								{index === 6 ? (
									<PlacementWithSend
										data={addIEPData.PlacementWithSEND}
										onChange={(data) => {
											if (
												JSON.stringify(
													addIEPData?.PlacementWithSEND,
												) !== JSON.stringify(data)
											) {
												setAddIEPData({
													...addIEPData,
													PlacementWithSEND: data,
												})
											}
										}}
										readOnly={readOnly}
									/>
								) : null}
							</CustomCollapsibleComponent>
						</Box>
					)
				})}
			</Box>
		</div>
	)
}

export default IEPForm
