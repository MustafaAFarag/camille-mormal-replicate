# Final Script - Camille Mormal Website Replica

---

## Introduction (1-2 minutes)

Camille Mormal.
الwebsite اللي كسب أحسن website في 2022 من Awwwards.
من أحسن المواقع اللي بجد فيها إحساس غريب لما تتحرك والحاجات دي بتتحرك بطريقة سلسة وإدمان.
الcarousel smooth بطريقة مش ممكنة.

ما تيجي نحاول نبني الموقع دا في الـ15 دقيقة اللي جاية؟
نشوف هي أحسن مننا في إيه.

تعالى نشوف الموقع بيقول إيه:
- في loading progress بيعمل load للصور
- بعدها 5 grids، كل grid فيه 4 صور
- الصورة اللي في النص بتـexpand وتاخد الشاشة كلها
- carousel بسيط وnavbar وcursor في النص
- وبص بس كدا وانت تعمل drag... في حاجة بتحصل للصور، effect كأنه بيتحرك على حسب الmouse بتاعك
- ولما تدوس على الصورة بتعمل animation expand كدا، وتدوس تاني تطلع برة
- والله أكبر بسم الله ما شاء الله

ماشي خلاص، فهمنا الدنيا. تعالى بقى نبدأ.

نعمل project react بvite. Select React، JavaScript، no TypeScript، yes لـESLint. ونستنى يعمل install. بعدها نinstall GSAP اللي هنحتاجه بعدين.

---

## Part 1: The Carousel - Building The Core (4-5 minutes)

أول حاجة، نبدأ بالcarousel لأنه دا الأساس. احنا هنload إيه أصلاً لو معملناش الcarousel؟

### Step 1: Basic Styling

نبدأ بالbody في `index.css`. نعمل الheight والwidth full، ونغير اللون للغامق دا. ولو شفت في الموضوع مفيش scrollbars يعني overflow hidden، ومفيش gaps يعني margin 0.

الصور كانوا جنب بعض يعني كلهم في container اسمه `image-track`. Display flex وشوية gap. نعمل position absolute علشان نcenter الموضوع بـ50% و50% وtranslate. المرادي هتبقى translate(-5.5%, -50%) علشان تبقى مظبوطة في النص.

إيه الحلاوة دي!

### Step 2: Mouse Tracking - The Magic Begins

قولنا إن كان في trick بيحصل في الcarousel، الصور كانت بتتحرك لما أحرك بالmouse. فأنا لازم أtrack الmouse movement من أول الimage-track للآخر.

تعالى نعمل event نسمع event لما الuser يدوس على الmouse بـwindow.onmousedown بيعمل track للـe.clientX اللي هو مكان الuser بدا يتحرك منه. ونربط الكلام دا بالcontainer image-track ونحتفظ بالرقم دا في dataset.

دي كانت أول خطوة. الخطوة اللي جاية لما يسيب الmouse يعني onMouseUp، نرجع الmouseDownAt لـ0 علشان الsafeguard، ونحفظ الpercentage الحالي في prevPercentage.

وطبعًا مننساش الtouch events للموبايل.

### Step 3: The Movement Logic

دلوقتي بقى، لما يبدأ يتحرك بالmouse يعني onMouseMove، علشان نعرف هو اتحرك قد إيه من البداية لحد ما اتحرك بالmouse.

إنه اتحرك قد إيه سهلة إنك تحسبها: minus الcurrent position من الstarting point. والmax distance هو نص الviewport يعني window.innerWidth / 2.

فلو أنا قسمت الrelative position بالmax distance هيكون decimal من 0 لـ1، وضربت في -50 هيكون معايا percentage. عاش عاش ماشي!

لو فاكر إن احنا عملنا translate للcontainer علشان نعمله center، الـ50% علشان الy-axis، والx-axis هو اللي بيتغير دلوقتي. هنجيب الcarousel يمين وشمال صح؟

يعني احنا كل اللي عايزينه إن نupdate الtranslate value. يعني track.style.transform = translate(nextPercentage - 5.5%, -50%).

طبعًا نعمل limits بالmin والmax علشان ميطلعش بره الcontainer، يعني بين 0 و-89.

ومتنساش نعمل safeguard: لما الmouseDownAt يكون 0، ميتحركش.

إيه دا إيه دا البتاع بيتحرك لوحده! 

تعالى نجرب... يا الله لما تمسك الimage بيعمل drag... تبًا للjavascript! نحط draggable="false" في الHTML.

### Step 4: The Parallax Effect

والparallax effect بتاع الصور اللي كان بيتحرك لما تحرك الكلام دا؟

سهلة! هنعمل loop بسيط، وبدل الـ50% 50% object position، هنعمل الـ50% الأولانية دي بالpercentage الجديدة اللي هي next percentage و+100 علشان هي كانت من 0 لـ-100، دلوقتي هي من 100 لـ0. وبدل ما كنا بنعمل CSS تعالى نستعمل animations علشان الeffect يكون أحسن زي الموقع الأصلي.

بس نتأكد إننا بس بنحرك الصور الظاهرة (opacity أكبر من 0.1)، علشان لما نعمل expand لصورة مخلهاش تتحرك.

والله أكبر بسم الله ما شاء الله، الcarousel خلص!

هنا الcomponent structure الكامل بتاع ImageTrack: نعمل refs للtrack وللimages، ونعمل array للimageUrls، وفي الreturn نعمل div للtrack بالdata attributes، ونmap على الimages ونحط ref لكل واحدة وdraggable false.

---

## Part 2: Quick UI Elements - The Polish (2 minutes)

### CrossCursor - الcrosshair اللي في النص

تعالى نعمل الحاجات الفرعية زي الcrosshair اللي في النص والnavbar.

سهلة! نعمل container بيجمع الhorizontal والvertical line. وفي الCSS نظبط الدنيا كدا يكون في النص، horizontal وvertical line. نحطه fixed في النص بـtop: 50% وleft: 50% وtranslate. وpointer-events: none علشان ميمنعش الclick. نحط transition على الopacity علشان لما نخفيه يختفي بsmoothness.

الCrossCursor component بياخد prop اسمه isHidden، ولو true نحط class "hidden" اللي بيخلي الopacity 0.

### Navbar - بسيطة جدًا

والnavbar بردو سهل، اتنين list items: Work وAbout، وبس كدا. نعملهم flex مع gap ونحطهم في النص بـjustify-content: center. Z-index عالي علشان يكون فوق كل حاجة.

الNavbar component بسيط جدًا: div للnav، ul للlist، وli للكل item.

### ImageIndicator - إحساس الاحترافية

آخر حاجة فرعية هي الimage indicator علشان إحساس الاحترافية. نحط currentImage — totalImages. والstyle: position fixed، bottom 2.3rem، left 50%، translateX(-50%) علشان يكون في النص.

الImageIndicator component بياخد props: currentImage وtotalImages، ونعرضهم في span.

### Connecting Everything in App.jsx

دلوقتي لازم نعرف الcurrent image ونوصل الcomponents مع بعض. في الApp.jsx اللي هو parent للindicator والimagetrack، نعمل state للcurrentImageIndex ونباصي الprop دا في الImageTrack وفي الImageIndicator.

لما الصورة تتexpand، نخفي الcursor. فنعمل state كمان لـisImageExpanded ونباصيه للCrossCursor كـisHidden، وللImageTrack كـonExpandChange.

في الApp، عندنا main، وجواه الNavbar، والCrossCursor (بالisHidden prop)، والImageTrack (بالonImageChange وonExpandChange props)، والImageIndicator (بالcurrentImage وtotalImages).

### Tracking Center Image

في الImageTrack، نستلم الprop دا ونعمل function calculateCenterImage. الوظيفة دي بتحسب أنهي صورة حاليًا في نص الشاشة. أولًا بتجيب نص الشاشة (X وY)، وتشوف لو النقطة دي جوا حدود أي صورة، ترجع رقمها. ولو مفيش صورة في النص بالظبط، بتقيس المسافة بين مركز كل صورة ومركز الشاشة، وترجع أقرب واحدة ليه.

بعدها نlisten على updateCenterImage. الوظيفة دي بتشوف أنهي صورة دلوقتي في نص الشاشة باستخدام calculateCenterImage، وبتعمل call للـonImageChange اللي كانت الprop، وبتعمل update للcurrentImageIndex. وبنعمل pass للindex دا في الImageIndicator.

نستخدم requestAnimationFrame علشان نعمل update continuously كل frame.

الfunction calculateCenterImage بتloop على كل الصور، وبتcheck لو viewport center جوا bounding box بتاع أي صورة. لو لأ، بتحسب المسافة بين كل صورة والviewport center وترجع الأقرب.

وفي updateCenterImage، بنcall calculateCenterImage وبنpass النتيجة للonImageChange، وبعدها بنطلب animation frame تاني. دي continuous loop.

---

## Part 3: The Click Magic - GSAP Time (3-4 minutes)

هنا بقى break 10 ثواني نجيب حد يساعدنا في الحاجات التقيلة.

**GSAP** - أحسن library animation موجودة بقالها أكتر من 25 سنة! وكل التفاصيل هنا قريب إن شاء الله.

نعمل install للـGSAP وnregister الuseGSAP hook اللي هو هو بالظبط useEffect بس للanimations.

### The Click Functionality

دلوقتي يا كينج، احنا وصلنا للحتة اللي بتخلي كل حاجة في الموقع تحس إنها عايشة. اللي هو لما تدوس على الصورة... تلاقيها بتنفجر كدا وتفرد على الشاشة كلها. زي الموقع الأصلي بالظبط.

أول حاجة نعمل state للـexpandedImageIndex علشان نعرف أنهي صورة متوسعة دلوقتي. ونعمل refs علشان نحتفظ بالclone بتاع الصورة والمكان الأصلي علشان نرجعها تاني.

نعمل function handleImageClick. لو الصورة اللي دوست عليها هي نفسها اللي متوسعة، يبقى collapse. لو لأ، يبقى expand. نcall الonExpandChange prop علشان نخبر الApp إن الصورة اتوسعت، ونset الexpandedImageIndex.

عندنا useState للexpandedImageIndex (بنبدأ بـnull)، وuseRef للclonedImage وللoriginalPosition وللsavedObjectPositions.

في handleImageClick، نcheck: لو expandedImageIndex === index، يبقى collapse. لو لأ، نcall onExpandChange(true) ونset expandedImageIndex للindex الجديد.

### GSAP Expansion Animation

ونبدأ الclick والclick out functionality. نستخدم useGSAP hook. لو الexpandedImageIndex null، معناها مفيش حاجة توسعت، فنرجع. لو لأ، نبدأ الanimation.

نجيب الصورة اللي اتدوس عليها ونجيب مكانها الحالي بـgetBoundingClientRect. نحسب المكان النهائي: top: 0، left: 0، width: 100vw، height: 100vh يعني fullscreen.

دلوقتي الحتة المهمة: ليه نعمل clone للصورة؟ علشان الtrack عنده transform، ودا بيخلي position: fixed يبقى relative للtrack مش للviewport. فنعمل clone ونحطه على body مباشرة.

نحفظ المكان الأصلي في originalPositionRef علشان نرجعها تاني. ونحفظ الobject-position بتاع كل الصور في savedObjectPositionsRef علشان لما نرجعها تبقى زي ما كانت بالظبط.

نستخدم gsap.set علشان نحط الclone في المكان الأصلي للصورة، ونخفي الصورة الأصلية. بعدها نعمل timeline ونanimate الclone لـfullscreen. في نفس الوقت نخفي باقي الصور بـopacity: 0.

ونقفل الinteraction مع الtrack بـpointerEvents: none. وفي الonComplete نحط click handler على الclone علشان لما ندوس عليه تاني يعمل collapse.

في الuseGSAP، نجيب الimages والclickedImage والtrack. نجيب rect بتاع الصورة. نعمل clone للصورة ونحطه على body. نحفظ originalPosition (top, left, width, height). نحفظ كل الobject-positions في array.

نعمل gsap.set للclone: position fixed، في نفس المكان بتاع الصورة الأصلية، zIndex 1000، cursor pointer. ونخفي الoriginal بـopacity 0.

نعمل gsap timeline. نanimate الclone: top 0، left 0، width 100vw، height 100vh، objectPosition center، duration 0.8، ease easeIn. في الonComplete نحط click handler.

نloop على كل الصور ونخفي اللي مش الclickedImage بـopacity 0، duration 1.5، في نفس الوقت (position 0 في الtimeline).

ونقفل الtrack pointer events.

في اللحظة دي، الcrosshair اللي في النص بيختفي (من خلال isHidden prop من App.jsx). والعنوان بيطلع فوق الشاشة بanimation smooth: "The Regeneration Suite". تحس إنك في gallery فني مش موقع.

في الApp، لو isImageExpanded true، نعرض div للimage-title-overlay وجواه h1 للtitle.

وفي الCSS، الoverlay في النص بـposition fixed وtransform translate، z-index عالي، pointer-events none، وanimation اسمه scaleIn بـdelay 0.2 ثانية.

الkeyframes scaleIn: من opacity 0 وscale 0.8، لـopacity 1 وscale 1.

### The Collapse Animation

وبعدين، لما تخلص تتفرج... تدوس تاني. نفس الزرار، نفس الصورة، بس المرادي كل حاجة بترجع بالعكس.

الـoverlay يختفي، الcrosshair يرجع مكانه في النص، والصورة تعمل كدا shrink لطيف، وترجع لمكانها الأصلي بين باقي الصور. كأنها بتقول: "أنا خلصت دوري." وفي ثواني، كل الصور التانية ترجع تتنفس من تاني، والcarousel يرجع يشتغل، كأن مفيش حاجة حصلت.

في الhandleImageClick، لو الindex اللي دوست عليه هو نفس الexpandedImageIndex، يبقى collapse. نcall الonExpandChange بـfalse علشان نخبر الApp، ونset الexpandedImageIndex بـnull فورًا علشان منعملش re-clicks.

نجيب الclone والoriginal position. نremove الevent listener من الclone. نعمل reverse animation: نرجع الclone لمكانه الأصلي ونرجع الobject-position المحفوظ بتاعه. في الonComplete نremove الclone من الDOM.

في نفس الوقت، نرجع كل الصور بـopacity: 1، ونرجع الobject-position المحفوظ بتاعهم. بعد ما الanimation يخلص، ننضف الinline styles بـclearProps ونرجع الtrack interaction بـpointerEvents: auto.

في handleImageClick، في الcollapse part: نcall onExpandChange(false)، نجيب كل الrefs. نset expandedImageIndex(null) فورًا.

لو في clone، نremove الevent listener. نجيب الsavedObjectPosition للصورة دي. نanimate الclone بـgsap.to: نرجعه للoriginal position (top, left, width, height)، ونرجع الobjectPosition، duration 0.8، ease power2.inOut. في onComplete نremove الclone.

نloop على كل الصور: نset الobjectPosition للsaved position، ونanimate opacity لـ1، duration 0.8.

بعدها نستخدم gsap.delayedCall (0.8 seconds): نclear الprops من كل الصور، ونرجع track pointerEvents لـauto.

كليك واحدة توسع الدنيا ✨  
كليك تانية، كل حاجة تهدى 💫

كل دا بيحصل في sequence صغير جدًا، بس الإحساس اللي بتاخده منه... priceless. هو دا الجمال اللي في التفاصيل.

---

## Part 4: The Loading Intro - The Opening Act (4-5 minutes)

أول ما الموقع يفتح... الكل واقف في انتظار اللحظة. الشاشة سودا، ومفيش غير رقم صغير بيزيد: "12%... 37%... 75%... 100%."

تحس كأنك بتتفرج على باب بيتفتح على عالم جديد.

### Step 1: Image Preloading

أول حاجة في الloading intro، نعمل preload للصور. Don't forget to mention to see the loading is waiting for the images! نعمل state للloadingProgress وللimagesLoaded.

في useEffect، نعمل function loadImages. نloop على كل الimageUrls ونعمل Promise لكل واحدة. نعمل Image object جديد، ولما يload نزود الloadedCount ونupdate الprogress. لما كل الpromises تخلص، نset الimagesLoaded بـtrue.

في الreturn، لو الصور لسه بتload، نعرض الloading progress. لو خلصت، نعرض الgrids.

الLoadingIntro component بياخد onComplete prop. عندنا state للloadingProgress وللimagesLoaded، وref للcontainer.

في useEffect، نعمل async function loadImages. نmap على imageUrls، لكل url نعمل Promise جديدة بـnew Image(). في onload نزود loadedCount ونupdate progress. في النهاية Promise.all على كل الpromises. لما يخلصوا نset imagesLoaded(true) بعد 300ms.

في الreturn، الloading-intro-overlay. جواه: لو مش loaded، نعرض loading-progress div بالprogress number.

### Step 2: The Grid Structure

وفجأة — البوابة تفتح. خمس أعمدة من الصور يظهروا قدامك، كل عمود بيتحرك في اتجاه عكس التاني، زي أوركسترا بصرية... كل صورة ليها توقيتها.

لما الصور تload، نعرض الgrid container. نعمل 5 grids (الأعمدة)، كل grid فيه 4 صور. الصورة اللي في النص من الgrid الوسطاني (gridIndex === 2 && imgIndex === 2) هي الhero image، دي اللي هتتوسع. باقي الصور نوزعهم من الimageUrls.

في الCSS، الcontainer display flex علشان الgrids يبقوا جنب بعض. كل grid عرضه 25vw وheight 100vh. الصور absolute positioning، كل واحدة height 25vh.

لو imagesLoaded true، نعرض intro-grid-container. نmap على [0,1,2,3,4] للgrids. لكل grid، نmap على [0,1,2,3] للصور. لو gridIndex === 2 && imgIndex === 2، دي الhero image (home.jpg). لو لأ، ناخد من imageUrls بـmodulo.

كل صورة: img tag، className intro-grid-image، draggable false.

الCSS: loading-intro-overlay: fixed، full screen، background dark، z-index عالي جدًا.

intro-grid-container: absolute، full size، flex، justify-content center.

intro-grid: width 25vw، height 100vh، flex column، position relative.

intro-grid-image: absolute، width 100%، height 25vh، object-fit cover، will-change transform.

### Step 3: GSAP Grid Animation

دلوقتي نanimate الgrids. نستخدم useGSAP، ونعمل master timeline. لما يخلص، نcall الonComplete prop علشان نخبر الApp إن الintro خلصت.

نloop على كل grid. كل grid بيتحرك في اتجاه عكس اللي قبله: لو الgridIndex even، يتحرك من تحت لفوق. لو odd، من فوق لتحت. نعمل set للـy value: لو من تحت لفوق، y: "100vh" (تحت الشاشة). لو من فوق لتحت، y: "-100vh" (فوق الشاشة).

بعدها نanimate كل الصور لـy: 0، يعني مكانها الأصلي. Duration 1.5، ease power2.inOut. وكلهم يبدأوا في نفس الوقت بالـ0 في الtimeline.

بس الhero image (gridIndex === 2 && imgIndex === 2) هنعملها special treatment، هنشوفها بعدين.

في useGSAP: نcheck لو مفيش imagesLoaded نرجع. نعمل masterTL بـgsap.timeline، في onComplete نcall onComplete prop.

نجيب كل الgrids. نloop على كل grid. نحدد isBottomToTop (even index). نloop على كل صورة. نحدد isHeroImage.

نعمل gsap.set: لو bottomToTop، نset top بتاع الصورة حسب imgIndex، وy: "100vh". لو لأ، نset bottom حسب imgIndex، top: "auto"، y: "-100vh".

لو مش hero image، نضيف للtimeline: animate y: 0، duration 1.5، ease power2.inOut، في position 0.

### Step 4: Hero Image Expansion

الصورة اللي في النص؟ هي البطل. تبدأ تطلع من مكانها بهدوء، تتحرك لفوق، وبعدين... تكبر. تكبر لحد ما تبلع الشاشة كلها. كل الصور التانية تختفي، الواجهة تنضف، ويبقى قدامك بس مشهد واحد ضخم... الصورة الرئيسية.

للhero image، نعمل clone ونحطه على body. نحط ID عليه "intro-hero-clone" علشان الImageTrack يلاقيه ويستخدمه بعدين (seamless transition!). 

نجيب مكان الصورة الأصلي بـgetBoundingClientRect. نset الclone إنه يبدأ من تحت الشاشة (top: imageTop + window.innerHeight). ونخفي الoriginal.

بعدها نanimate على مرحلتين:
1. أول animation: طلع لمكانها الأصلي (top: imageTop)، duration 1.5، مع باقي الصور (position 0 في الtimeline).
2. تاني animation: كبر للfullscreen (100vw × 100vh)، duration 1.2، بعد ما توصل مكانها بـ0.2 ثانية (+=0.2).

في الonComplete، نremove الcontainer بتاع الgrids كله علشان منضفش الDOM. وفي الonComplete بتاع الmaster timeline، نfade out الoverlay وندي الكنترول للImageTrack.

لو isHeroImage: نجيب rect. نعمل clone. نحطه على body. نحط id: "intro-hero-clone". نجيب imageTop، imageLeft، imageWidth، imageHeight.

نعمل gsap.set للclone: position fixed، top: imageTop + innerHeight (تحت الشاشة)، left، width، height، zIndex عالي جدًا، objectFit cover.

نخفي الoriginal بـgsap.set opacity 0.

نضيف للmasterTL:
- أول to: animate clone، top: imageTop، duration 1.5، ease power2.inOut، position 0.
- تاني to: animate clone، top 0، left 0، width 100vw، height 100vh، objectPosition center، duration 1.2، ease power2.inOut، position "+=0.2". في onComplete نremove containerRef.

### Step 5: Seamless Transition to Main Site

الانترو خلصت، الكاميرا سلمت البطل للموقع. ImageTrack يستلم المشهد بدون ما تحس إن في قفلة أو بداية جديدة.

في App.jsx، نعمل state للintroComplete. لما الintro يخلص، نcall handleIntroComplete، ودا بيset الisImageExpanded بـtrue والintroComplete بـtrue. نpass الstartExpanded prop للImageTrack، ودا بيكون true لو الintro خلصت والصورة expanded.

نخلي الCrossCursor مخفي لحد ما الintro يخلص ولحد ما الصورة تتقفل. ونعرض الLoadingIntro بس لو الintro لسه مخلصتش.

في App: عندنا state للintroComplete. function handleIntroComplete بتset isImageExpanded(true) وintroComplete(true).

في الreturn: لو مش introComplete، نعرض LoadingIntro بالonComplete prop. الCrossCursor بـisHidden: isImageExpanded || !introComplete. الImageTrack بـstartExpanded: introComplete && isImageExpanded.

في ImageTrack، لو startExpanded true، معناها احنا جايين من الintro. ندور على الclone اللي الintro عمله (intro-hero-clone). لو لقيناه، نستخدمه مباشرة بدون animation جديدة. نتأكد إنه في fullscreen، ونحط عليه click handler، ونخفي كل الصور التانية. دا بيدينا seamless transition من الintro للموقع الأساسي!

نستخدم hasCompletedIntroRef علشان نعمل الكلام دا مرة واحدة بس (أول مرة بعد الintro)، مش كل مرة يعمل expand.

في الImageTrack عندنا ref: hasCompletedIntroRef.

في useGSAP: لو expandedImageIndex null نرجع. لو startExpanded && expandedImageIndex === 0 && !hasCompletedIntroRef.current:

نset hasCompletedIntroRef(true). ندور على clone بـgetElementById("intro-hero-clone").

لو لقيناه: نعمل gsap.set: position fixed، top 0، left 0، width 100vw، height 100vh، objectFit cover، zIndex 1000. نremove الid. نحط الclone في clonedImageRef.

نعمل click handler ونحطه على الclone. نخفي images[0] والصور التانية بـopacity 0. نقفل track pointerEvents.

وبعدها نreturn (منكملش باقي الfunction).

لو مش startExpanded، نكمل عادي بالexpansion animation العادية.

كل دا حصل في ست ثواني. ست ثواني بس، لكنها بتحطك جوه العالم قبل ما الموقع حتى يبدأ يتكلم.

---

## Conclusion (1 minute)

والله يا جدعان، دا كان الموقع.

من carousel smooth بتتبع الmouse،  
لـanimations بتوسع وتطلع وترجع بالعكس،  
لـloading intro بيدخلك في الموضوع كأنك في سينما.

كل دا ببساطة:
- React للstructure
- GSAP للanimations
- وشوية رياضيات للcarousel

الكود كله موجود، جربوا تلعبوا فيه.  
غيروا الألوان، زودوا صور، اعملوا الموقع بتاعكم.

ولو عملتوا حاجة جامدة، ابعتوها!  
وإن شاء الله نتكلم عن GSAP بالتفصيل في فيديو قريب.

يلا بينا، عاش! 🚀
