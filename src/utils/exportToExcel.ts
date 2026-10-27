import * as XLSX from 'xlsx';
import { SurveyResponse, QuizResult } from '../types';

/**
 * Generates and downloads a real .xlsx Excel document containing all real participation data:
 * - General Summary sheet
 * - Quizzes sheet
 * - Trivia games sheet
 * - Citizen surveys sheet
 */
export function exportResultsToExcel(
  surveys: SurveyResponse[],
  quizResults: QuizResult[] = []
): { success: boolean; totalRecords: number; filename: string } {
  const wb = XLSX.utils.book_new();

  // Separate quizzes and trivias
  const quizzes = quizResults.filter(q => q.activityType === 'quiz');
  const trivias = quizResults.filter(q => q.activityType === 'trivia');

  // 1. Resumen General Sheet
  const totalSurveys = surveys.length;
  const totalQuizzes = quizzes.length;
  const totalTrivias = trivias.length;
  const totalActivities = totalSurveys + totalQuizzes + totalTrivias;

  const learnedCount = surveys.filter(s => s.learnedSomethingNew).length;
  const learningRate = totalSurveys > 0 ? Math.round((learnedCount / totalSurveys) * 100) : 0;

  const prideCount = surveys.filter(s => s.increasedPrideInBiodiversity).length;
  const prideRate = totalSurveys > 0 ? Math.round((prideCount / totalSurveys) * 100) : 0;

  const avgInterest = totalSurveys > 0
    ? (surveys.reduce((acc, s) => acc + s.interestScore, 0) / totalSurveys).toFixed(2)
    : '0.00';

  const avgTriviaScore = totalTrivias > 0
    ? Math.round(trivias.reduce((acc, t) => acc + t.scorePercentage, 0) / totalTrivias)
    : 0;

  const summaryData = [
    { Métrica: 'Plataforma', Valor: 'BioExplora Colombia · Voluntariado Ambiental' },
    { Métrica: 'Fecha de Generación del Reporte', Valor: new Date().toLocaleString('es-CO') },
    { Métrica: 'Total de Participaciones Registradas', Valor: totalActivities },
    { Métrica: 'Total de Encuestas de Aprendizaje', Valor: totalSurveys },
    { Métrica: 'Total de Quices Realizados', Valor: totalQuizzes },
    { Métrica: 'Total de Trivias Jugadas', Valor: totalTrivias },
    { Métrica: 'Tasa de Aprendizaje Efectivo (Encuestas)', Valor: `${learningRate}%` },
    { Métrica: 'Índice de Orgullo por la Biodiversidad', Valor: `${prideRate}%` },
    { Métrica: 'Calificación Promedio de Interés (1 a 5)', Valor: `${avgInterest} / 5.0` },
    { Métrica: 'Promedio de Aciertos en Trivias', Valor: `${avgTriviaScore}%` },
    { Métrica: 'Especies Insignia del Voluntariado', Valor: 'Lagarto Azul, Tití Cabeciblanco, Rana Dorada de Supatá, Perico Pintado' },
    { Métrica: 'Almacenamiento y Protección de Datos', Valor: 'Registros reales persistentes en almacenamiento local del proyecto' },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // Set column widths
  wsSummary['!cols'] = [{ wch: 42 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen General');

  // 2. Resultados Quices Sheet
  const quizzesData = quizzes.map((q, idx) => ({
    'N°': idx + 1,
    'ID Registro': q.id,
    'Fecha y Hora': new Date(q.timestamp).toLocaleString('es-CO'),
    'Participante': q.participantName || 'Participante Anónimo',
    'Actividad': q.activityName || 'Quiz de Biodiversidad',
    'Preguntas Totales': q.totalQuestions,
    'Aciertos': q.correctAnswers,
    'Fallos': q.totalQuestions - q.correctAnswers,
    'Porcentaje de Aciertos': `${q.scorePercentage}%`,
    'Estado': q.scorePercentage >= 60 ? 'Aprobado' : 'Reforzar Conocimiento',
    'Detalle de Preguntas y Respuestas': q.questionsSummary 
      ? q.questionsSummary.map(item => `[${item.isCorrect ? '✓' : '✗'}] ${item.question}: Seleccionó "${item.selectedAnswer}"`).join(' | ')
      : 'Respuestas consolidadas',
  }));

  const wsQuizzes = XLSX.utils.json_to_sheet(
    quizzesData.length > 0 
      ? quizzesData 
      : [{ 'Mensaje': 'No hay quices registrados aún. Los nuevos quices completados aparecerán aquí automáticamente.' }]
  );
  if (quizzesData.length > 0) {
    wsQuizzes['!cols'] = [
      { wch: 6 }, { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 28 }, 
      { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 18 }, { wch: 60 }
    ];
  }
  XLSX.utils.book_append_sheet(wb, wsQuizzes, 'Resultados Quices');

  // 3. Resultados Trivias Sheet
  const triviasData = trivias.map((t, idx) => ({
    'N°': idx + 1,
    'ID Registro': t.id,
    'Fecha y Hora': new Date(t.timestamp).toLocaleString('es-CO'),
    'Participante': t.participantName || 'Participante Anónimo',
    'Actividad': t.activityName || 'Trivia: ¿Cuánto sabes sobre Colombia?',
    'Preguntas Totales': t.totalQuestions,
    'Aciertos': t.correctAnswers,
    'Puntaje Obtenido (%)': `${t.scorePercentage}%`,
    'Desempeño': t.scorePercentage === 100 
      ? 'Experto en Biodiversidad' 
      : t.scorePercentage >= 75 
        ? 'Gran Conocedor' 
        : t.scorePercentage >= 50 
          ? 'Explorador en Progreso' 
          : 'Principiante Curioso',
    'Detalle de Respuestas': t.questionsSummary
      ? t.questionsSummary.map(item => `[${item.isCorrect ? '✓' : '✗'}] ${item.question} -> Eligió: "${item.selectedAnswer}" (Correcta: "${item.correctAnswer}")`).join(' || ')
      : 'Respuestas consolidadas',
  }));

  const wsTrivias = XLSX.utils.json_to_sheet(
    triviasData.length > 0 
      ? triviasData 
      : [{ 'Mensaje': 'No hay trivias registradas aún. Al completar la trivia interactiva se registrará aquí.' }]
  );
  if (triviasData.length > 0) {
    wsTrivias['!cols'] = [
      { wch: 6 }, { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 32 }, 
      { wch: 18 }, { wch: 10 }, { wch: 22 }, { wch: 26 }, { wch: 60 }
    ];
  }
  XLSX.utils.book_append_sheet(wb, wsTrivias, 'Resultados Trivias');

  // 4. Resultados Encuestas Sheet
  const surveysData = surveys.map((s, idx) => ({
    'N°': idx + 1,
    'ID Encuesta': s.id,
    'Fecha y Hora': new Date(s.timestamp).toLocaleString('es-CO'),
    'Participante': s.participantName || 'Participante Ciudadano',
    'Rango de Edad': s.participantAge,
    'Departamento': s.department,
    'Especie Evaluada': s.speciesEvaluated,
    '¿Conocía la especie antes?': s.knewSpeciesBefore ? 'Sí' : 'No',
    '¿Sabía que era endémica?': s.knewItWasEndemic ? 'Sí' : 'No',
    '¿Aprendió algo nuevo?': s.learnedSomethingNew ? 'Sí' : 'No',
    '¿Aumentó su orgullo nacional?': s.increasedPrideInBiodiversity ? 'Sí' : 'No',
    'Calificación de Interés (1-5)': s.interestScore,
    'Disposición a Proteger (1-5)': s.willingnessToProtect,
    'Comentarios y Retroalimentación': s.feedbackComment || '(Sin comentario escrito)',
  }));

  const wsSurveys = XLSX.utils.json_to_sheet(
    surveysData.length > 0
      ? surveysData
      : [{ 'Mensaje': 'No hay encuestas registradas.' }]
  );
  if (surveysData.length > 0) {
    wsSurveys['!cols'] = [
      { wch: 6 }, { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 15 }, 
      { wch: 20 }, { wch: 26 }, { wch: 26 }, { wch: 26 }, { wch: 24 }, 
      { wch: 28 }, { wch: 26 }, { wch: 26 }, { wch: 45 }
    ];
  }
  XLSX.utils.book_append_sheet(wb, wsSurveys, 'Resultados Encuestas');

  // Generate real .xlsx file and trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `BioExplora_Resultados_Completos_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);

  return {
    success: true,
    totalRecords: totalActivities,
    filename,
  };
}
