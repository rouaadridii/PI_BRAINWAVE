import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { BackHeaderComponent } from './components/back-header/back-header.component';
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
import { GenerateCertifComponent } from './components/GuestionQuizComponents/generate-certif/generate-certif.component';
import { NgChartsModule } from 'ng2-charts';
import { PaypalPaymentComponent } from './components/GuestionQuizComponents/paypal-payment/paypal-payment.component';
import { StripePaymentComponent } from './components/GuestionQuizComponents/stripe-payment/stripe-payment.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    BackHeaderComponent,
    BackMenuAdminComponent,
    //Quiz
    QuizComponent,
    QuestionComponent,
    ResponseComponent,
    AddQuizComponent,
    AddQuestionComponent,
    AddResponseComponent,
    UpdateQuizComponent,
    UpdateQuestionComponent,
    UpdateResponseComponent,
    TakeQuizComponent,
    QuizStatisticsComponent,
    GenerateCertifComponent,
    PaypalPaymentComponent,
    StripePaymentComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
