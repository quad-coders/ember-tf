import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import ApplicationInstance from '@ember/application/instance';
import { tracked } from '@glimmer/tracking';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd'; // https://www.npmjs.com/package/@tensorflow-models/coco-ssd

export default class CameraAccessComponent extends Component {
  declare cameraContainer: any;
  declare children: any[];
  declare model: any;
  @tracked declare canLoadCamera: boolean;

  constructor(owner: ApplicationInstance, args: any) {
    super(owner, args);

    // TODO: do not why i need this, but without it there is console error
    tf.sequential();

    this.children = [];
    cocoSsd.load().then((loadedModel) => this.executeLoad(loadedModel));
  }

  cameraContainerMod = modifier((containerElement: HTMLElement) => {
    this.cameraContainer = containerElement;
  });

  accessCameraMod = modifier((videoElement: HTMLVideoElement) => {
    this.setupCamera(videoElement);
  });

  executeLoad(loadedModel: cocoSsd.ObjectDetection) {
    if (!this.model) {
      this.model = loadedModel;
    }

    this.canLoadCamera = true;
  }

  async setupCamera(videoElement: HTMLVideoElement): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      videoElement.addEventListener(
        'loadeddata',
        this.predictWebcam.bind(this, videoElement)
      );
    } catch (err) {
      console.error('Error accessing the camera', err);
    }
  }

  predictWebcam(videoElement: any) {
    // Now let's start classifying a frame in the stream.
    this.model
      .detect(videoElement)
      .then((predictions: any) =>
        this.runPredictions(predictions, videoElement)
      );
  }

  runPredictions(predictions: any, videoElement: any) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < this.children.length; i++) {
      this.cameraContainer.removeChild(this.children[i]);
    }
    this.children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText =
          predictions[n].class +
          ' - with ' +
          Math.round(parseFloat(predictions[n].score) * 100) +
          '% confidence.';
        // @ts-expect-error - ok
        p.style =
          'margin-left: ' +
          predictions[n].bbox[0] +
          'px; margin-top: ' +
          (predictions[n].bbox[1] - 10) +
          'px; width: ' +
          (predictions[n].bbox[2] - 10) +
          'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        // @ts-expect-error - ok
        highlighter.style =
          'left: ' +
          predictions[n].bbox[0] +
          'px; top: ' +
          predictions[n].bbox[1] +
          'px; width: ' +
          predictions[n].bbox[2] +
          'px; height: ' +
          predictions[n].bbox[3] +
          'px;';

        this.cameraContainer.appendChild(highlighter);
        this.cameraContainer.appendChild(p);
        this.children.push(highlighter);
        this.children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(this.predictWebcam.bind(this, videoElement));
  }
}
