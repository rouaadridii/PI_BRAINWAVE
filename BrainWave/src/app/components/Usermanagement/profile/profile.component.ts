import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import * as faceapi from 'face-api.js';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  userEmail: string | null = null;
  userProfile: any = null;
  profileImageUrl: string | ArrayBuffer | null = '';
  user: any;
  isModalOpen = false;  // To control modal visibility
  isPasswordModalOpen = false;
  isConfirmationModalOpen = false; // To control confirmation modal visibility
  errorMessage: string | null = null;
  constructor(private userService: UserService) {}
  
  isFaceRegistrationModalOpen = false;
    @ViewChild('videoElement') videoElementRef!: ElementRef;
    @ViewChild('canvasElement') canvasElementRef!: ElementRef;
    video: HTMLVideoElement | null = null;
    canvas: HTMLCanvasElement | null = null;
    stream: MediaStream | null = null;
    isRegisteringFace = false;
    registrationMessage = '';
    registrationError = '';



  userupdate = { 
    name: '', 
    surname: '', 
    phoneNumber: '', 
    address: '' 
  };

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(
      (data) => {
        this.user = data;  // Store user data
        this.loadFaceAPIModels();
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
    
  }

  async loadFaceAPIModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models/face_recognition');
        console.log('Face API models loaded successfully in ProfileComponent.');
    } catch (error) {
        console.error('Error loading Face API models in ProfileComponent:', error);
        this.registrationError = 'Failed to load face recognition models.';
    }
}

openFaceRegistrationModal() {
  this.isFaceRegistrationModalOpen = true;
  setTimeout(() => {
      this.setupWebcam().then(() => {
          // Start continuous face detection after the webcam is set up
          if (this.video) {
              this.detectFacesContinuously();
          }
      });
  }, 0); // A small delay to allow the modal to render
}

closeFaceRegistrationModal() {
    this.isFaceRegistrationModalOpen = false;
    this.stopWebcam();
    this.registrationMessage = '';
    this.registrationError = '';
}



async setupWebcam() {
  try {
      this.video = this.videoElementRef.nativeElement; // Access nativeElement here
      console.log('Video element:', this.video); 
      if (!this.video) {
          console.error('Video element is null.');
          this.registrationError = 'Error accessing video element.';
          return;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Webcam stream:', this.stream); 
      this.video.srcObject = this.stream;
  } catch (error) {
      console.error('Error accessing webcam:', error);
      this.registrationError = 'Error accessing webcam. Please ensure you have a camera and have granted permission.';
  }
}

stopWebcam() {
  if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.video!.srcObject = null;
      this.stream = null;
  }
}

async detectFacesContinuously() {
  console.log('detectFacesContinuously() is running');
  if (!this.video || !this.canvas) {
      return;
  }
  const displaySize = { width: this.video.width, height: this.video.height };
  this.canvas.width = displaySize.width;
  this.canvas.height = displaySize.height;
  const ctx = this.canvas.getContext('2d');
  if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      try {
          const detection = await faceapi.detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
          if (detection) {
              const resizedDetections = faceapi.resizeResults(detection, displaySize);
              faceapi.draw.drawDetections(this.canvas, resizedDetections);
          }
      } catch (error) {
          console.error('Error during continuous face detection:', error);
      }
  }
  requestAnimationFrame(this.detectFacesContinuously.bind(this));
}

async captureAndRegisterFace() {
  console.log('captureAndRegisterFace() called');
  console.log('Video element ref in capture:', this.videoElementRef); // Check again
    this.video = this.videoElementRef.nativeElement;
    this.canvas = this.canvasElementRef.nativeElement;
    console.log('Video element in capture:', this.video);
    console.log('Canvas element in capture:', this.canvas);

    if (!this.video || !this.canvas || !this.user) {
        console.log('Video, canvas, or user is null');
        return;
    }

  this.isRegisteringFace = true;
  this.registrationMessage = 'Capturing and processing face...';
  this.registrationError = '';

  const displaySize = { width: this.video.width, height: this.video.height };
  this.canvas.width = displaySize.width;
  this.canvas.height = displaySize.height;
  const ctx = this.canvas.getContext('2d');
  console.log('Canvas context:', ctx);
  ctx?.drawImage(this.video, 0, 0, displaySize.width, displaySize.height);
  console.log('drawImage called');
  const imageDataURL = this.canvas.toDataURL('image/jpeg');
  console.log('Captured image data URL:', imageDataURL);
  try {
    const detection = await faceapi.detectSingleFace(this.canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    console.log('Face detection result:', detection);
    if (!detection) {
        this.registrationError = 'No face detected. Please try again.';
        this.isRegisteringFace = false;
        return;
    }

    // Draw the bounding box
    const box = detection.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, { label: 'Detected Face' });
    drawBox.draw(this.canvas);

    const descriptor = detection.descriptor;
    console.log('Face descriptor captured:', descriptor);
    console.log('Calling userService.registerFace() with email:', this.user.email, 'and descriptor:', Array.from(descriptor));
    // Uncomment and implement your backend call
    this.userService.registerFace(this.user.email, Array.from(descriptor)).subscribe(
        (response) => {
            this.registrationMessage = 'Face registered successfully!';
            this.isRegisteringFace = false;
            setTimeout(() => this.closeFaceRegistrationModal(), 2000); // Close modal after success
        },
        (error) => {
            console.error('Error registering face:', error);
            this.registrationError = 'Failed to register face. Please try again.';
            this.isRegisteringFace = false;
        }
    );
    console.log('userService.registerFace() call initiated');

} catch (error) {
    console.error('Error during face detection or registration:', error);
    this.registrationError = 'An error occurred during face processing.';
    this.isRegisteringFace = false;
}
}

  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal when the close button is clicked
  closeModal() {
    this.isModalOpen = false;
  }

  openPasswordModal() {
    this.isPasswordModalOpen = true;
    this.errorMessage = null;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
  }

  showConfirmationModal() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match!';
      return;
    }
  
    // Don't send password update request here
    this.isPasswordModalOpen = false;
    this.isConfirmationModalOpen = true;
    this.errorMessage = null;
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
  }

  updateProfile() {
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        this.closeModal(); // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }

  // Handle the actual password update after confirmation
  submitPasswordUpdate() {
    const passwordUpdateRequest = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    };
    console.log('Old Password:', passwordUpdateRequest.oldPassword); // Add this line

    // Call the service to update the password
    this.userService.updateUserProfile(passwordUpdateRequest).subscribe(
      (response) => {
        console.log('Password updated successfully:', response);
        this.closePasswordModal(); // Close the password modal after successful update
        this.closeConfirmationModal(); // Close the confirmation modal
        this.errorMessage = null; // Clear any previous error messages
        this.userService.logout();
      },
      (error) => {
        console.error('Error updating password:', error);
        this.errorMessage = 'Failed to update password. Please try again.';
      }
    );
  }

  
  
  
}
