/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

import * as cocoSsd from '@tensorflow-models/coco-ssd';

let modelPromise;

window.onload = () => modelPromise = cocoSsd.load();

const classificationButton = document.getElementById('classification-button');
const classificationSection = document.getElementById('classification-section');
const detectButton = document.getElementById('detection-button');
const detectSection = document.getElementById('detection-section');
const detectionCanvas = document.getElementById('detection-canvas');
const detectionImage = document.getElementById('detection-image');

classificationButton.onclick = function() {
  classificationSection.style.display='block';
  detectSection.style.display='none';
}
detectButton.onclick = function() {
  classificationSection.style.display='none';
  detectSection.style.display='block';
}

let imgInput = document.getElementById('image-input');
imgInput.addEventListener('change', function(e) {
    if (e.target.files) {
        let imageFile = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
          detectionImage.src = e.target.result;
          const context = detectionCanvas.getContext('2d');
          context.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
        };
        reader.readAsDataURL(imageFile);
   }
});

const select = document.getElementById('base_model');
select.onchange = async (event) => {
  const model = await modelPromise;
  model.dispose();
  modelPromise = cocoSsd.load(
      {base: event.srcElement.options[event.srcElement.selectedIndex].value});
};

const detectionStart = document.getElementById('detection-start');
detectionStart.onclick = async () => {
  const model = await modelPromise;
  console.log('model loaded');
  console.time('predict1');
  const detectionResult = await model.detect(detectionImage);
  console.timeEnd('predict1');

  const contextDetection = detectionCanvas.getContext('2d');
  contextDetection.drawImage(detectionImage, 0, 0, 450, 450 * detectionImage.height / detectionImage.width);
  contextDetection.font = 'bold 15px Arial';

  console.log('number of detections: ', detectionResult.length);
  for (let i = 0; i < detectionResult.length; i++) {
    contextDetection.beginPath();
    contextDetection.rect(...detectionResult[i].bbox);
    contextDetection.lineWidth = 1;
    contextDetection.strokeStyle = 'red';
    contextDetection.fillStyle = 'red';
    contextDetection.stroke();
    contextDetection.fillText(
      detectionResult[i].score.toFixed(3) + ' ' + detectionResult[i].class, detectionResult[i].bbox[0]+3,
      detectionResult[i].bbox[1] > 15 ? detectionResult[i].bbox[1] : detectionResult[i].bbox[1] + 15);
  }
};
