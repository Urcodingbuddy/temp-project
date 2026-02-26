const mongoose = require('mongoose')
const express = require('express')
const myPeeguConfig = require('../../startup/config').myPeeguConfig
const utils = require('../../utility/utils')
const { collections } = require('../../utility/databaseConstants')

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			minlength: 1,
			maxlength: 60,
			trim: true,
		},
		user_id: {
			type: String,
			minlength: 1,
			maxlength: 15,
			unique: true,
			trim: true,
		},
		lastName: {
			type: String,
			maxlength: 60,
			trim: true,
		},
		middleName: {
			type: String,
			maxlength: 60,
			trim: true,
		},
		fullName: {
			type: String,
			minlength: 1,
			maxlength: 120,
			trim: true,
		},
		uniqueKey: {
			type: String,
			trim: true,
		},
		profilePicture: {
			type: String,
			maxlength: 200,
			trim: true,
		},
		email: {
			type: String,
			minlength: 5,
			maxlength: 255,
			trim: true,
			required: true,
		},
		phone: {
			type: String,
			minlength: 10,
			maxlength: 15,
			trim: true,
		},
		password: {
			type: String,
		},
		permissions: {
			type: [String],
			required: true,
		},
		authToken: String,
		profilePictureUrl: {
			type: String,
			trim: true,
		},
		profilePicture: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			trim: true,
		},
		assignedSchools: [{ type: mongoose.Schema.Types.ObjectId, ref: collections.schools }],
		createdByName: {
			type: String,
			trim: true,
		},
		updatedByName: {
			type: String,
			trim: true,
		},
		createdById: {
			type: String,
			trim: true,
		},
		updatedById: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true },
)

const MyPeeguUser = mongoose.model(collections.mypeeguUsers, userSchema)
module.exports.MyPeeguUser = MyPeeguUser
