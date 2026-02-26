import axios from 'axios'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	UpdateIEP,
	addIEP,
	deleteIEP,
	getStudentIEPData,
	gets3Url,
	setRecallIEPAPI,
	studentBRForIEP,
	studentIEPverification,
	viewByIDIEP,
} from './iEPSlice'
import { routePaths } from '../../../routes/routeConstants'

export const fetchAllStudentIEP = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	download,
) => {
	const body = {
		filter: {
			academicYear: filterData.selectdAYs ?? [],
			schoolIds: filterData.selectdSchools,
			classroomIds: filterData.selectdClassrooms,
			section: filterData.selectdSections,
		},
		searchText,
	}
	if (page) {
		body['page'] = page
	}
	if (pageSize) {
		body['pageSize'] = pageSize
	}
	if (sortKeys) {
		body['sortKeys'] = sortKeys
	}
	if (download) {
		return body
	}
	dispatch(getStudentIEPData({ body }))
}

export const checkStudentIEP = async (
	body,
	setResponse,
	dispatch,
	setStudentVerificationDailog,
) => {
	const res = await dispatch(studentIEPverification({ body }))

	if (!res.error) {
		setResponse(res?.payload?.isCheckListRecordExist ?? false)
		setStudentVerificationDailog(!res?.payload?.isCheckListRecordExist)

		if (res?.payload?.isCheckListRecordExist ?? false) {
			await dispatch(studentBRForIEP({ ...body, id: body.id }))
		}
	}
}

export const getBackgroundColor = (score, light) => {
	let color
	if (score?.toLowerCase() === 'low') {
		color = light
			? 'globalElementColors.lightGreen'
			: 'globalElementColors.green2'
	} else if (score?.toLowerCase() === 'moderate') {
		color = light
			? 'globalElementColors.lightYellow'
			: 'globalElementColors.yellow'
	} else if (score?.toLowerCase() === 'high') {
		color = light
			? 'globalElementColors.lightRed'
			: 'globalElementColors.red'
	}
	return color
}

export const addOrUpdate = async (
	barFilterData,
	formdata,
	isupdate,
	dispatch,
	student,
	isS3Required,
	isBaseLineRecordExist,
	refreshList,
	id,
	handleClose,
) => {
	let body = {
		academicYear: barFilterData.selectdAYs,
		school: barFilterData.selectdSchools,
	}
	if (isupdate) {
		body['id'] = id
	}

	let studentData = {
		user_id: student.user_id,
		studentName: student.studentName,
	}

	if (formdata?.checkList?.length > 0) {
		studentData['checkList'] = formdata?.checkList
	}
	if (formdata?.baselineComments && isBaseLineRecordExist) {
		const obj = {}
		Object.keys(formdata?.baselineComments)?.forEach((key) => {
			obj[key] = formdata?.baselineComments[key]
		})
		studentData['baseLine'] = obj
	}
	if (formdata?.Evolution) {
		const obj = {}
		obj['requirement'] =
			formdata?.Evolution?.[localizationConstants.requirement]
		obj['availability'] =
			formdata?.Evolution?.[localizationConstants.availability]
		obj['diagnosis'] = formdata?.Evolution?.[localizationConstants.comments]
		obj['reportLink'] = isS3Required
			? (formdata?.Evolution?.[localizationConstants.reportLink]
					?.fileName ?? '')
			: (formdata?.Evolution?.[localizationConstants.reportLink]
					?.fileUrl ?? '')

		studentData['Evolution'] = obj
	}

	if (formdata?.AccommodationFromBoard) {
		const obj = {}
		obj['requirement'] =
			formdata?.AccommodationFromBoard?.[
				localizationConstants.requirement
			]?.[0]
		obj['certificate'] =
			formdata?.AccommodationFromBoard?.[
				localizationConstants.certificate
			]?.[0]
		obj['approvalfromRegionalOffice'] =
			formdata?.AccommodationFromBoard?.[
				localizationConstants.regionalOffice
			]?.[0]
		obj['accommodationApplicable'] =
			formdata?.AccommodationFromBoard?.[
				localizationConstants.selectAccomodationApplicable
			]?.[0]
		obj['viewCircular'] =
			formdata?.AccommodationFromBoard?.[
				localizationConstants.viewCircular
			] ?? ''
		studentData['AccommodationFromBoard'] = obj
	}

	if (formdata?.TransitionPlanning) {
		const obj = {}
		obj['communityExperience'] = {
			value:
				formdata?.TransitionPlanning?.[
					localizationConstants.communityExperience
				]?.value ?? '',
			comments:
				formdata?.TransitionPlanning?.[
					localizationConstants.communityExperience
				]?.comments ?? '',
		}
		obj['activitiesOfDailyLiving'] = {
			value:
				formdata?.TransitionPlanning?.[
					localizationConstants.activitiesofDailyLiving
				]?.value ?? '',
			comments:
				formdata?.TransitionPlanning?.[
					localizationConstants.activitiesofDailyLiving
				]?.comments ?? '',
		}
		obj['functional_VocationalAssistance'] = {
			value:
				formdata?.TransitionPlanning?.[
					localizationConstants.functionalVocationalAssistance
				]?.value ?? '',
			comments:
				formdata?.TransitionPlanning?.[
					localizationConstants.functionalVocationalAssistance
				]?.comments ?? '',
		}
		studentData['transitionPlanning'] = obj
	}

	if (formdata?.PlacementWithSEND) {
		const obj = {}
		obj['individual'] = {
			value:
				formdata?.PlacementWithSEND?.[localizationConstants.individual]
					?.value ?? '',
			frequency:
				formdata?.PlacementWithSEND?.[localizationConstants.individual]
					?.frequency ?? [],
		}
		obj['group'] = {
			value:
				formdata?.PlacementWithSEND?.[localizationConstants.group]
					?.value ?? '',
			frequency:
				formdata?.PlacementWithSEND?.[localizationConstants.group]
					?.frequency ?? [],
		}
		studentData['PlacementWithSEND'] = obj
	}

	if (formdata?.internalAccommodation) {
		const data = formdata?.internalAccommodation
		const obj = {}
		obj['requirement'] =
			data?.[localizationConstants.requirement]?.value ?? ''
		obj['specialEducationClasses'] =
			data?.[localizationConstants.specialEducationClasses]?.value ?? ''
		obj['behavioralInterventions'] = {
			value:
				data?.[localizationConstants.behavioralInterventions]?.value ??
				'',
			comments:
				data?.[localizationConstants.behavioralInterventions]
					?.comments ?? '',
		}
		obj['oneToOneWithHRT_CT'] = {
			value:
				data?.[localizationConstants.oneToOneWithHRT_CT]?.value ?? '',
			comments:
				data?.[localizationConstants.oneToOneWithHRT_CT]?.comments ??
				'',
		}
		obj['focusClasses'] = {
			value: data?.[localizationConstants.focusClasses]?.value ?? '',
			comments:
				data?.[localizationConstants.focusClasses]?.comments ?? '',
		}
		obj['accomondationsInSchool'] = {
			value:
				data?.[localizationConstants.accomondationsInSchool]?.value ??
				'',
			comments:
				data?.[localizationConstants.accomondationsInSchool]
					?.comments ?? '',
		}
		obj['assistiveTechnology'] = {
			value:
				data?.[localizationConstants.assistiveTechnology]?.value ?? '',
			comments:
				data?.[localizationConstants.assistiveTechnology]?.comments ??
				'',
		}

		studentData['AccommodationInternal'] = obj
	}
	const action = isupdate ? UpdateIEP : addIEP

	body['studentData'] = studentData
	if (isS3Required) {
		const res = await dispatch(
			gets3Url({
				body: {
					fileName:
						formdata?.Evolution?.[localizationConstants.reportLink]
							?.fileName,
					urlFor: 'IEP',
				},
			}),
		)
		if (!res.error) {
			const file =
				formdata?.Evolution?.[localizationConstants.reportLink]?.file
			const fileData = file instanceof Blob ? file : new Blob([file])
			const s3link = res.payload?.s3link
			const headers = {
				'Content-Type': file.type,
			}

			await axios.put(s3link, fileData, {
				headers: headers,
			})
			const response = await dispatch(action({ body, isS3Required }))

			if (!response.error) {
				refreshList()
				handleClose()
			}
		}
	} else {
		const response = await dispatch(action({ body, isS3Required }))
		if (!response.error) {
			refreshList()
			handleClose()
		}
	}
}

export const viewByIdAPICallFunction = async (dispatch, rowId) => {
	let res = await dispatch(viewByIDIEP({ id: rowId }))
	if (!res?.error) {
		const row = res.payload.data
		await dispatch(
			studentBRForIEP({
				id: row.studentId,
				academicYear: row.academicYear,
			}),
		)
	}
}

export const formDataFormat = (data, setAddIEPData, setOldAddIEPData, user) => {
	const formdata = {
		baselineComments: {
			[localizationConstants.physical]: data?.baseLine?.Physical ?? [],
			[localizationConstants.social]: data?.baseLine?.Social ?? [],
			[localizationConstants.emotional]: data?.baseLine?.Emotional ?? [],
			[localizationConstants.cognitive]: data?.baseLine?.Cognitive ?? [],
			[localizationConstants.linguistic]:
				data?.baseLine?.Linguistic ?? [],
		},
		checkList: data?.checkList ?? [],
		AccommodationFromBoard: {
			[localizationConstants.requirement]: [
				data?.AccommodationFromBoard?.requirement,
			] ?? ['No'],
			[localizationConstants.certificate]: [
				data?.AccommodationFromBoard?.certificate,
			] ?? ['No'],
			[localizationConstants.regionalOffice]: [
				data?.AccommodationFromBoard?.approvalfromRegionalOffice,
			] ?? ['No'],
			[localizationConstants.selectAccomodationApplicable]: [
				data?.AccommodationFromBoard?.accommodationApplicable,
			] ?? ['No'],
			[localizationConstants.viewCircular]: {
				cbseCircularPdfAddress:
					user?.profile?.cbseCircularPdfAddress ?? '',
				icseCircularPdfAddress:
					user?.profile?.icseCircularPdfAddress ?? '',
			},
		},
		TransitionPlanning: {
			[localizationConstants.communityExperience]: data
				?.transitionPlanning?.communityExperience ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.activitiesofDailyLiving]: data
				?.transitionPlanning?.activitiesOfDailyLiving ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.functionalVocationalAssistance]: data
				?.transitionPlanning?.functional_VocationalAssistance ?? {
				value: 'No',
				comments: [],
			},
		},
		Evolution: {
			[localizationConstants.requirement]:
				data?.Evolution?.requirement ?? 'No',
			[localizationConstants.availability]:
				data?.Evolution?.availability ?? 'No',
			[localizationConstants.comments]: data?.Evolution?.diagnosis ?? [],
			[localizationConstants.reportLink]: {
				file: '',
				fileName: '',
				fileUrl: data?.Evolution?.reportLink ?? '',
				fileType: getMimeType(data?.Evolution?.reportLink),
			},
		},
		internalAccommodation: {
			[localizationConstants.requirement]: {
				value: data?.AccommodationInternal?.requirement ?? 'No',
			},
			[localizationConstants.specialEducationClasses]: {
				value:
					data?.AccommodationInternal?.specialEducationClasses ??
					'No',
			},
			[localizationConstants.behavioralInterventions]: data
				?.AccommodationInternal?.behavioralInterventions ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.oneToOneWithHRT_CT]: data
				?.AccommodationInternal?.oneToOneWithHRT_CT ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.focusClasses]: data?.AccommodationInternal
				?.focusClasses ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.accomondationsInSchool]: data
				?.AccommodationInternal?.accomondationsInSchool ?? {
				value: 'No',
				comments: [],
			},
			[localizationConstants.assistiveTechnology]: data
				?.AccommodationInternal?.assistiveTechnology ?? {
				value: 'No',
				comments: [],
			},
		},
		PlacementWithSEND: {
			[localizationConstants.individual]: data?.PlacementWithSEND
				?.individual ?? {
				value: 'No',
				frequency: [],
			},
			[localizationConstants.group]: data?.PlacementWithSEND?.group ?? {
				value: 'No',
				frequency: [],
			},
		},
	}
	setAddIEPData(formdata)
	setOldAddIEPData(formdata)
}
export const getMimeType = (url) => {
	if (url?.endsWith('.jpeg')) {
		return 'image/jpeg'
	} else if (url?.endsWith('.png')) {
		return 'image/png'
	} else if (url?.endsWith('.pdf')) {
		return 'application/pdf'
	}
	return ''
}

export const handleIepRecordDeletion = async (
	id,
	dispatch,
	setDeleteIndividualRecordDialog,
	rehreshList,
) => {
	const response = await dispatch(deleteIEP(id))

	if (!response?.error) {
		setDeleteIndividualRecordDialog(false)
		dispatch(setRecallIEPAPI(true))
		rehreshList()
	}
}

export const ValidationCheckforAddIEP = (
	data,
	isBaseLineRecordExist,
	variants,
) => {
	if (
		isBaseLineRecordExist &&
		Object.keys(data?.baselineComments)?.some(
			(key) =>
				!(
					data?.baselineComments[key]?.length > 0 &&
					data?.baselineComments[key]?.every((d) => d?.length > 0)
				),
		)
	) {
		return false
	}
	if (
		data?.checkList?.some(
			(d) =>
				variants?.[d.category]?.toLowerCase() !== 'low' &&
				!(
					d?.shortTermGoal?.length > 0 &&
					d?.shortTermGoal?.every((d) => d?.length > 0) &&
					d?.longTermGoal?.length > 0 &&
					d?.longTermGoal?.every((d) => d?.length > 0)
				),
		)
	) {
		return false
	}
	if (
		data?.Evolution?.[localizationConstants.requirement] === 'Yes' &&
		Object.keys(data?.Evolution)?.some(
			(key) =>
				key === localizationConstants?.comments &&
				!(
					data?.Evolution[key]?.length > 0 &&
					data?.Evolution[key]?.every((d) => d?.length > 0)
				),
		)
	) {
		return false
	}

	if (
		data?.internalAccommodation?.[localizationConstants.requirement]
			?.value === 'Yes' &&
		Object.keys(data?.internalAccommodation)?.some((key) =>
			key === localizationConstants.specialEducationClasses ||
			key === localizationConstants.requirement
				? false
				: data?.internalAccommodation?.[key]?.value === 'Yes' &&
					!(
						data?.internalAccommodation?.[key]?.comments?.length >
							0 &&
						data?.internalAccommodation?.[key]?.comments?.every(
							(d) => d?.length > 0,
						)
					),
		)
	) {
		return false
	}
	if (
		Object.keys(data?.PlacementWithSEND || {}).some((key) => {
			const placement = data?.PlacementWithSEND?.[key]
			const frequency = Array.isArray(placement?.frequency)
				? placement?.frequency
				: [] // fallback to empty array if not array

			return (
				placement?.value === 'Yes' &&
				(!frequency.length || // empty array = invalid
					!frequency.every((d) => typeof d === 'number' && d > 0)) // check all are positive numbers
			)
		})
	) {
		return false
	}

	if (
		Object.keys(data?.TransitionPlanning).some(
			(key) =>
				data?.TransitionPlanning?.[key]?.value === 'Yes' &&
				!(
					data?.TransitionPlanning?.[key]?.comments?.length > 0 &&
					data?.TransitionPlanning?.[key]?.comments?.every(
						(d) => d?.length > 0,
					)
				),
		)
	) {
		return false
	}

	return true
}
