import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { BackMenuAdminComponent } from './components/back-menu-admin/back-menu-admin.component';

//Quiz
import { QuizComponent } from './components/GuestionQuizComponents/quiz/quiz.component';
import { QuestionComponent } from './components/GuestionQuizComponents/question/question.component';
import { ResponseComponent } from './components/GuestionQuizComponents/response/response.component';

import { AddQuizComponent } from './components/GuestionQuizComponents/add-quiz/add-quiz.component';
import { AddQuestionComponent } from './components/GuestionQuizComponents/add-question/add-question.component';
import { AddResponseComponent } from './components/GuestionQuizComponents/add-response/add-response.component';
import { UpdateQuizComponent } from './components/GuestionQuizComponents/update-quiz/update-quiz.component';
import { UpdateQuestionComponent } from './components/GuestionQuizComponents/update-question/update-question.component';
import { UpdateResponseComponent } from './components/GuestionQuizComponents/update-response/update-response.component';
import { TakeQuizComponent } from './components/GuestionQuizComponents/take-quiz/take-quiz.component';
import { QuizStatisticsComponent } from './components/GuestionQuizComponents/quiz-statistics/quiz-statistics.component';
import { StripePaymentComponent } from './components/GuestionQuizComponents/stripe-payment/stripe-payment.component';
import { TakeQuizTrainingComponent } from './components/GuestionQuizComponents/take-quiz-training/take-quiz-training.component';
import { QuizGeneratorComponent } from './components/GuestionQuizComponents/quiz-generator/quiz-generator.component';

//End Quiz

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path:'app-back-menu-admin',component:BackMenuAdminComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  //Quiz route
  { path: 'quizzes', component: QuizComponent },
  { path: 'questions/:quizId', component: QuestionComponent },
  { path: 'responses/:id', component: ResponseComponent },

  { path: 'add-quiz', component: AddQuizComponent },
  { path: 'add-question/:quizId', component: AddQuestionComponent },
  { path: 'add-response/:idQuestion', component: AddResponseComponent },

  { path: 'update-quiz/:quizId', component: UpdateQuizComponent },
  { path: 'update-question/:quizId/:id', component: UpdateQuestionComponent },
  { path: 'update-response/:questionId/:id', component: UpdateResponseComponent },

  { path: 'take-quiz/:quizId', component: TakeQuizComponent },

  { path: 'quiz-statistics', component: QuizStatisticsComponent },

  { path: 'payement-stripe', component: StripePaymentComponent },

  { path: 'take-quiz-training/:quizId', component: TakeQuizTrainingComponent },

  { path: 'quiz-generator', component: QuizGeneratorComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }