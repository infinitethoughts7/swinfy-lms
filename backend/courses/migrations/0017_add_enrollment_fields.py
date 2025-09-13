# Generated manually to add missing fields to Enrollment

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0016_add_lesson_video_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='enrollment',
            name='enrollment_date',
            field=models.DateTimeField(auto_now_add=True, help_text='Date of enrollment'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='completion_date',
            field=models.DateTimeField(blank=True, null=True, help_text='Date of course completion'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='last_accessed',
            field=models.DateTimeField(blank=True, null=True, help_text='Last time student accessed the course'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='progress_percentage',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=5, validators=[models.Q(('gte', 0), ('lte', 100))], help_text='Course completion percentage'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='current_module',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, to='courses.coursemodule', help_text='Current module being studied'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='current_lesson',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, to='courses.lesson', help_text='Current lesson being studied'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='amount_paid',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, help_text='Amount paid for the course'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='payment_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded'), ('partial', 'Partial')], default='pending', max_length=20, help_text='Payment status'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='payment_method',
            field=models.CharField(blank=True, max_length=50, help_text='Payment method used'),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='payment_reference',
            field=models.CharField(blank=True, max_length=100, help_text='Payment reference number'),
        ),
    ]
