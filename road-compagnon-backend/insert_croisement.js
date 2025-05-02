require('dotenv').config();
const mongoose = require('mongoose');
const Croisement = require('./models/croisement');

// 📌 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => {
        console.error("❌ Erreur de connexion :", err);
        process.exit(1); // Quitte le processus en cas d'échec
    });

// 📌 Données complètes des panneaux
const croisements = [
    
        {"explication_generale": "هذا الباب سوف تتمكن من التعرف على كيفية التصرف عند التعرض لإحدى الحالات التالية:\n\nمقاطعة بطرق بها حواجز أشغال\n\nمقاطعة بمعبر ضيق\n\nمقاطعة صعبة بطريق جبلي\n\nالسؤال المطروح: من يمر أولاً؟ للإجابة عن ذلك يجب التعرف على القواعد الواجب تطبيقها",
        
        
    
           "paragraphes": [
            { "description": "جاء بمجلة الطرقات أن المقاطعة هي موضع العربتين المتحركتين عندما تلتقيان في اتجاه متقابل بسبيلين مختلفين من معبر واحد. تكون المقاطعة على اليمين. على كل سائق أن يترك عند المقاطعة مسافة جانبية كافية وأن ينحاز عند الاقتضاء إلى أقصى اليمين." },
            { "description": "في هذه الوضعية، تمثل السيارة الحمراء المتوقفة على الرصيف في حالة مخالفة حاجزًا من جهتي، لذلك يجب أن أترك أولوية المرور للعربة القادمة من الاتجاه المعاكس. إذًا يجب التخفيض من السرعة، وعند الاقتضاء التوقف. وإن تعذر عليه ذلك بسبب عائق ما، فعليه أن يخفض من سرعته، وعند الاقتضاء أن يتوقف إن كان هناك عائق من جانبه لتمكين مستعملي الطريق القادمين من الاتجاه المعاكس من المرور." },
            { "description": "المقاطعة على الطرقات الضيقة: في طريق عادي ضيق، تترك العربة التي يتجاوز حجمها الخارجي أو حمولتها 2 متر عرضًا و7 أمتار طولًا (باعتبارها مقطورة) الأولوية للعربات الخفيفة.\n\nاستثناء: تتمتع حافلات النقل العمومي داخل مناطق العمران بالأولوية.\n\nبهذا الجزء الضيق من الطريق، يجب أن أخفض من السرعة، وعند الاقتضاء أن أتوقف لفتح مجال المرور لهذه الحافلة." },
            { "description": "إذا كان الطريق ضيقًا بالأنفاق والجسور، سوف تعترضني علامة فتح المجال والأولوية. فإذا كان إطار العلامة أحمر، أفسح مجال المرور، أما إذا كان الإطار أزرق، أتمتع بالأولوية." },
            { "description": "عند وجود هذه العلامة: يجب على العربات القادمة من الاتجاه المعاكس فسح مجال المرور." },
            { "description": "عند وجود هذه العلامة: أفسح المجال للعربات القادمة من الاتجاه المعاكس." },
            { "description": "المقاطعة بالطرقات الجبلية المنحدرة: في طريق جبلي ضيق، تترك العربة النازلة الأولوية للعربة الصاعدة. بهذه الطريق الضيقة والمنحدرة، يجب أن أترك الأولوية للسيارة الصفراء الصاعدة." }
        ]
    }
    
];

async function insertCroisements() {
    try {
        // 📌 Suppression des anciens enregistrements
        await Croisement.deleteMany();
        console.log("🗑️ Anciennes données supprimées.");

        // 📌 Insertion des nouvelles données
        await Croisement.insertMany(croisements);
        console.log("✅ Tous les croisements ont été insérés avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l’insertion :", error);
    } finally {
        mongoose.connection.close(); // Fermeture propre de la connexion
    }
}

// 📌 Exécuter l'insertion
insertCroisements();
