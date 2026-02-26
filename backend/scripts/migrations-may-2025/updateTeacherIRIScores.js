const mongoose = require('mongoose');
const { MONGODB_URI } = require('./migrations-utils');
const { Teacher } = require('../../models/database/myPeegu-teacher');

async function runMigration() {
  console.log('Migration started...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Fetch teachers with teacherIRIReport size > 0
  const teachers = await Teacher.find({
    $expr: { $gt: [ { $size: "$teacherIRIReport" }, 0 ] },
    isDeleted: { $ne: true }
  }).select('teacher_id teacherName teacherIRIReport');

  console.log(`Found ${teachers.length} teachers to update...`);

  const bulkOps = [];

  const SectionEnum = Object.freeze({
  WELLBEING: "wellbeing",
  TEACHER_IRI: "teacherIRI",
});


 const sectionRules = {
  [SectionEnum.WELLBEING]: {
    specialQuestions: [1, 2, 3, 8, 9, 11, 12, 13, 17, 18],
    scoreFn: marks => 7 + 1 - marks,
  },
  [SectionEnum.TEACHER_IRI]: {
    specialQuestions: [3, 7, 12, 13, 14, 15, 19],
    scoreFn: marks => 4 + 1 - marks,
  },
};

  
  function updateQuestionScores(sectionName, questions) {
    const rules = sectionRules[sectionName];
    if (!rules) return questions; // If no rules, return as-is
  
    const { specialQuestions, scoreFn } = rules;
  
    return questions.map(q => {
      if (specialQuestions.includes(q.questionNumber)) {
        return { ...q, marks: scoreFn(q.marks) }; // update marks
      }
      return q; // unchanged if not special
    });
  }
  
  function getUpdatedMarks(sectionName, questionNumber, marks) {
    const rules = sectionRules[sectionName];
    if (!rules) return marks; // no rules for this section
  
    const { specialQuestions, scoreFn } = rules;
  
    if (specialQuestions.includes(questionNumber)) {
      return scoreFn(marks);  // apply special logic
    }
    return marks; // unchanged if not special
  }

  function calculateAverage(array) {
	return array.reduce((acc, curr) => acc + curr, 0) / array.length
}

  for (const teacher of teachers) {
    const teacherIRIAssessment = teacher.teacherIRIReport;

    // 2. Update question scores based on section rules
    const updatedIRIAssessment = updateQuestionScores(
      SectionEnum.TEACHER_IRI,
      teacherIRIAssessment
    );

    // 3. Calculate final score
    const finalScore = updatedIRIAssessment
      .map(iri => iri.marks)
      .reduce((acc, cur) => acc + cur, 0);

    // 4. Distribute into NP categories
    const perspectiveTaking = [];
    const fantasy = [];
    const empathicConcern = [];
    const personalDistress = [];

    for (const { questionNumber, marks } of updatedIRIAssessment) {
      if ([3, 8, 11, 15, 21, 25, 28].includes(questionNumber)) {
        perspectiveTaking.push(marks);
      } else if ([1, 5, 7, 12, 16, 23, 26].includes(questionNumber)) {
        fantasy.push(marks);
      } else if ([2, 4, 9, 14, 18, 20, 22].includes(questionNumber)) {
        empathicConcern.push(marks);
      } else if ([6, 10, 13, 17, 19, 24, 27].includes(questionNumber)) {
        personalDistress.push(marks);
      }
    }

    const perspectiveTakingAvg = calculateAverage(perspectiveTaking);
    const fantasyScaleAvg = calculateAverage(fantasy);
    const empathicConcernAvg = calculateAverage(empathicConcern);
    const personalDistressAvg = calculateAverage(personalDistress);

    // Log details for this teacher
    console.log(`Teacher: ${teacher.teacherName} (${teacher.teacher_id})`);
    console.log(`  Original: ${JSON.stringify(teacherIRIAssessment)}`);
    console.log(`  Updated : ${JSON.stringify(updatedIRIAssessment)}`);
    console.log(`  Scores -> Final: ${finalScore}, Perspective: ${perspectiveTakingAvg}, Fantasy: ${fantasyScaleAvg}, Empathic: ${empathicConcernAvg}, Distress: ${personalDistressAvg}`);

    // 5. Prepare bulk update operation
    bulkOps.push({
      updateOne: {
        filter: { _id: teacher._id },
        update: {
          $set: {
            finalScore,
            perspectiveNP: perspectiveTakingAvg,
            fantasyNP: fantasyScaleAvg,
            empathicNP: empathicConcernAvg,
            personalDistressNP: personalDistressAvg
          }
        }
      }
    });
  }

  // 6. Execute bulk operation only if there’s something to update
  if (bulkOps.length > 0) {
    const bulkResult = await Teacher.bulkWrite(bulkOps);
    console.log('Bulk update result:', bulkResult);
  } else {
    console.log('No teachers to update.');
  }

  await mongoose.disconnect();
  console.log('Migration completed.');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
